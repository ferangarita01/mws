#!/bin/bash

# Firebase Migration Tools - Quick Start
# Este script proporciona acceso rápido a todas las herramientas de migración

set -e

# Colores
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${BLUE}"
echo "=========================================="
echo "  Firebase Migration Tools - Quick Start"
echo "=========================================="
echo -e "${NC}"

show_help() {
    echo "Comandos disponibles:"
    echo ""
    echo "  migrate      - Ejecutar migración completa (interactiva)"
    echo "  update       - Actualizar configuración de archivos"
    echo "  validate     - Validar migración completada"
    echo "  template     - Generar templates de configuración"
    echo "  help         - Mostrar esta ayuda"
    echo ""
    echo "Ejemplos:"
    echo "  ./quick-start.sh migrate"
    echo "  ./quick-start.sh update ./src mi-nuevo-proyecto"
    echo "  ./quick-start.sh validate mi-nuevo-proyecto"
    echo "  ./quick-start.sh template mi-nuevo-proyecto"
}

case "$1" in
    "migrate")
        echo -e "${GREEN}Iniciando migración completa...${NC}"
        bash scripts/migration/firebase-migrate.sh
        ;;
    "update")
        if [ -z "$2" ] || [ -z "$3" ]; then
            echo -e "${YELLOW}Uso: $0 update <directorio> <nuevo-project-id>${NC}"
            exit 1
        fi
        echo -e "${GREEN}Actualizando configuración...${NC}"
        node scripts/migration/config-migrator.js update "$2" "$3"
        ;;
    "validate")
        if [ -z "$2" ]; then
            echo -e "${YELLOW}Uso: $0 validate <project-id> [directorio]${NC}"
            exit 1
        fi
        echo -e "${GREEN}Validando migración...${NC}"
        node scripts/migration/migration-validator.js "$2" "${3:-.}"
        ;;
    "template")
        if [ -z "$2" ]; then
            echo -e "${YELLOW}Uso: $0 template <project-id> [directorio-output]${NC}"
            exit 1
        fi
        echo -e "${GREEN}Generando templates...${NC}"
        node scripts/migration/config-migrator.js template "$2" "${3:-./config-templates}"
        ;;
    "help"|*)
        show_help
        ;;
esac