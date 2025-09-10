#!/bin/bash

# Firebase Migration Utility Script
# Este script automatiza el proceso de migración de un proyecto Firebase

set -e

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Función para logging
log() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')] $1${NC}"
}

error() {
    echo -e "${RED}[ERROR] $1${NC}"
}

success() {
    echo -e "${GREEN}[SUCCESS] $1${NC}"
}

warning() {
    echo -e "${YELLOW}[WARNING] $1${NC}"
}

# Función para verificar dependencias
check_dependencies() {
    log "Verificando dependencias..."
    
    if ! command -v firebase &> /dev/null; then
        error "Firebase CLI no está instalado. Instala con: npm install -g firebase-tools"
        exit 1
    fi
    
    if ! command -v gcloud &> /dev/null; then
        warning "Google Cloud SDK no está instalado. Algunas funciones pueden no estar disponibles."
    fi
    
    if ! command -v node &> /dev/null; then
        error "Node.js no está instalado."
        exit 1
    fi
    
    success "Todas las dependencias están disponibles"
}

# Función para autenticación
authenticate() {
    log "Iniciando autenticación..."
    
    echo "Por favor, autentícate con la cuenta de origen:"
    firebase login
    
    echo "Por favor, autentica también con gcloud para la cuenta de origen:"
    gcloud auth login
    
    success "Autenticación completada"
}

# Función para listar proyectos disponibles
list_projects() {
    log "Listando proyectos Firebase disponibles..."
    firebase projects:list
}

# Función para hacer backup de configuración
backup_config() {
    local project_id=$1
    local backup_dir="./backups/$(date +%Y%m%d_%H%M%S)"
    
    log "Creando backup de configuración para el proyecto: $project_id"
    
    mkdir -p "$backup_dir"
    
    # Cambiar al proyecto de origen
    firebase use "$project_id"
    
    # Backup de configuración de funciones
    if firebase functions:config:get > "$backup_dir/functions-config.json" 2>/dev/null; then
        success "Configuración de funciones respaldada"
    else
        warning "No se pudo respaldar la configuración de funciones"
    fi
    
    # Backup de reglas de Firestore
    if firebase firestore:rules:get > "$backup_dir/firestore.rules" 2>/dev/null; then
        success "Reglas de Firestore respaldadas"
    else
        warning "No se pudieron respaldar las reglas de Firestore"
    fi
    
    # Backup de reglas de Storage
    if firebase storage:rules:get > "$backup_dir/storage.rules" 2>/dev/null; then
        success "Reglas de Storage respaldadas"
    else
        warning "No se pudieron respaldar las reglas de Storage"
    fi
    
    # Crear archivo de información del proyecto
    cat > "$backup_dir/project-info.json" << EOF
{
    "sourceProjectId": "$project_id",
    "backupDate": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
    "backupDir": "$backup_dir"
}
EOF
    
    success "Backup creado en: $backup_dir"
    echo "$backup_dir"
}

# Función para migrar datos de Firestore
migrate_firestore() {
    local source_project=$1
    local target_project=$2
    local backup_bucket=$3
    
    log "Migrando datos de Firestore..."
    
    # Exportar desde proyecto origen
    log "Exportando datos de Firestore desde $source_project..."
    gcloud firestore export "gs://$backup_bucket/firestore-backup" --project="$source_project"
    
    # Importar a proyecto destino
    log "Importando datos de Firestore a $target_project..."
    gcloud firestore import "gs://$backup_bucket/firestore-backup" --project="$target_project"
    
    success "Migración de Firestore completada"
}

# Función para migrar Storage
migrate_storage() {
    local source_bucket=$1
    local target_bucket=$2
    
    log "Migrando archivos de Storage..."
    
    if command -v gsutil &> /dev/null; then
        gsutil -m cp -r "gs://$source_bucket/*" "gs://$target_bucket/"
        success "Migración de Storage completada"
    else
        warning "gsutil no está disponible. Migración de Storage omitida."
    fi
}

# Función para aplicar configuración al nuevo proyecto
apply_config() {
    local target_project=$1
    local backup_dir=$2
    
    log "Aplicando configuración al proyecto destino: $target_project"
    
    # Cambiar al proyecto destino
    firebase use "$target_project"
    
    # Aplicar reglas de Firestore
    if [ -f "$backup_dir/firestore.rules" ]; then
        cp "$backup_dir/firestore.rules" ./firestore.rules
        firebase deploy --only firestore:rules
        success "Reglas de Firestore aplicadas"
    fi
    
    # Aplicar reglas de Storage
    if [ -f "$backup_dir/storage.rules" ]; then
        cp "$backup_dir/storage.rules" ./storage.rules
        firebase deploy --only storage
        success "Reglas de Storage aplicadas"
    fi
    
    # Aplicar configuración de funciones
    if [ -f "$backup_dir/functions-config.json" ]; then
        warning "La configuración de funciones debe aplicarse manualmente:"
        echo "firebase functions:config:set [key]=[value] para cada configuración en $backup_dir/functions-config.json"
    fi
}

# Función de validación post-migración
validate_migration() {
    local target_project=$1
    
    log "Validando migración..."
    
    firebase use "$target_project"
    
    # Verificar que el proyecto esté activo
    if firebase projects:list | grep -q "$target_project"; then
        success "Proyecto destino está disponible"
    else
        error "No se puede acceder al proyecto destino"
        return 1
    fi
    
    # Aquí se pueden agregar más validaciones específicas
    success "Validación básica completada"
}

# Función principal
main() {
    echo "==================================="
    echo "  Firebase Migration Utility"
    echo "==================================="
    
    check_dependencies
    authenticate
    
    echo ""
    list_projects
    
    echo ""
    read -p "Ingresa el ID del proyecto de origen: " source_project
    read -p "Ingresa el ID del proyecto de destino: " target_project
    read -p "Ingresa el nombre del bucket para backup temporal: " backup_bucket
    
    if [ -z "$source_project" ] || [ -z "$target_project" ]; then
        error "Debes proporcionar tanto el proyecto de origen como el de destino"
        exit 1
    fi
    
    echo ""
    echo "Resumen de migración:"
    echo "Proyecto origen: $source_project"
    echo "Proyecto destino: $target_project"
    echo "Bucket backup: $backup_bucket"
    
    read -p "¿Continuar con la migración? (y/N): " confirm
    if [[ $confirm != [yY] ]]; then
        echo "Migración cancelada"
        exit 0
    fi
    
    # Ejecutar migración
    backup_dir=$(backup_config "$source_project")
    
    if [ -n "$backup_bucket" ]; then
        migrate_firestore "$source_project" "$target_project" "$backup_bucket"
        # migrate_storage "${source_project}.appspot.com" "${target_project}.appspot.com"
    fi
    
    apply_config "$target_project" "$backup_dir"
    validate_migration "$target_project"
    
    success "¡Migración completada exitosamente!"
    echo ""
    echo "Pasos manuales restantes:"
    echo "1. Actualizar archivos de configuración en tus aplicaciones"
    echo "2. Redespegar Cloud Functions si las tienes"
    echo "3. Verificar configuración de Authentication"
    echo "4. Probar funcionalidad de la aplicación"
}

# Ejecutar función principal si el script se ejecuta directamente
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    main "$@"
fi