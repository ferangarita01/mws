# Guía de Migración de Proyecto Firebase

Esta guía proporciona instrucciones paso a paso para migrar un proyecto Firebase de una cuenta de Google a otra cuenta del mismo proveedor.

## Requisitos Previos

- Acceso administrativo a ambas cuentas de Google (cuenta origen y destino)
- Firebase CLI instalado (`npm install -g firebase-tools`)
- Permisos de propietario en el proyecto Firebase original
- Una nueva cuenta de Google donde se creará el proyecto migrado

## Pasos de Migración

### 1. Preparación y Respaldo

#### 1.1 Crear respaldo de la configuración actual
```bash
# Exportar configuración de Firebase
firebase use --add    # Seleccionar proyecto actual
firebase functions:config:get > config-backup.json
```

#### 1.2 Documentar configuración actual
- Listar todas las aplicaciones web/móviles registradas
- Documentar configuración de autenticación
- Exportar reglas de Firestore/Realtime Database
- Listar funciones de Cloud Functions desplegadas
- Documentar configuración de Storage

### 2. Creación del Nuevo Proyecto

#### 2.1 Crear proyecto en la nueva cuenta
1. Acceder a [Firebase Console](https://console.firebase.google.com) con la nueva cuenta
2. Crear nuevo proyecto con el mismo nombre (si está disponible)
3. Configurar plan de facturación si es necesario

#### 2.2 Configurar servicios básicos
- Habilitar Authentication
- Crear base de datos Firestore/Realtime Database
- Configurar Storage
- Habilitar Cloud Functions (si se usa)

### 3. Migración de Datos

#### 3.1 Migración de Firestore
```bash
# Exportar datos de Firestore
gcloud firestore export gs://[BUCKET_ORIGEN]/firestore-backup

# Importar a nuevo proyecto
gcloud firestore import gs://[BUCKET_ORIGEN]/firestore-backup --project=[NUEVO_PROYECTO_ID]
```

#### 3.2 Migración de Realtime Database
```bash
# Exportar datos
firebase database:get / > database-backup.json

# Importar a nuevo proyecto (cambiar a nuevo proyecto primero)
firebase use [NUEVO_PROYECTO_ID]
firebase database:set / database-backup.json
```

#### 3.3 Migración de Storage
```bash
# Usar gsutil para copiar archivos
gsutil -m cp -r gs://[BUCKET_ORIGEN]/* gs://[BUCKET_DESTINO]/
```

### 4. Migración de Configuración

#### 4.1 Reglas de seguridad
- Copiar reglas de Firestore desde la consola original
- Aplicar reglas en el nuevo proyecto
- Copiar reglas de Storage
- Actualizar reglas de Realtime Database si aplica

#### 4.2 Configuración de Authentication
- Configurar proveedores de autenticación (Google, Facebook, etc.)
- Migrar usuarios (nota: las contraseñas no se pueden migrar)
- Configurar dominios autorizados

### 5. Migración de Aplicaciones

#### 5.1 Registrar aplicaciones
- Crear nuevas aplicaciones web/iOS/Android en el nuevo proyecto
- Descargar nuevos archivos de configuración:
  - `google-services.json` (Android)
  - `GoogleService-Info.plist` (iOS)
  - Configuración web de Firebase

#### 5.2 Actualizar código de aplicación
- Reemplazar archivos de configuración
- Actualizar Project ID en el código si está hardcodeado
- Actualizar URLs de Cloud Functions

### 6. Migración de Cloud Functions

#### 6.1 Redespegar funciones
```bash
# Cambiar al nuevo proyecto
firebase use [NUEVO_PROYECTO_ID]

# Redespegar funciones
firebase deploy --only functions
```

#### 6.2 Actualizar configuración
```bash
# Aplicar configuración de funciones
firebase functions:config:set key1=value1 key2=value2
```

### 7. Verificación y Pruebas

#### 7.1 Verificar datos migrados
- Comprobar que todos los documentos de Firestore están presentes
- Verificar archivos en Storage
- Probar autenticación con usuarios de prueba

#### 7.2 Probar funcionalidad
- Ejecutar todas las funciones críticas de la aplicación
- Verificar que las notificaciones push funcionan
- Comprobar integraciones con terceros

### 8. Migración de Producción

#### 8.1 Planificar ventana de mantenimiento
- Notificar a usuarios sobre tiempo de inactividad
- Planificar horario de menor tráfico

#### 8.2 Ejecutar migración
1. Realizar respaldo final
2. Ejecutar migración de datos
3. Actualizar aplicaciones en producción
4. Probar funcionalidad crítica
5. Monitorear errores

## Consideraciones Importantes

### Limitaciones
- **Usuarios**: Las contraseñas de usuarios no se pueden migrar. Los usuarios deberán restablecer sus contraseñas
- **Custom Claims**: Se perderán y deberán reconfigurarse
- **Tokens**: Todos los tokens de acceso se invalidarán
- **Analytics**: El historial de Firebase Analytics no se puede migrar

### Costos
- Considerar costos de transferencia de datos
- Evaluar diferencias en planes de facturación
- Monitorear uso después de la migración

### Seguridad
- Revisar y actualizar reglas de seguridad
- Rotar claves API si es necesario
- Verificar configuración de dominios autorizados

## Troubleshooting

### Errores Comunes
1. **Permisos insuficientes**: Verificar roles de IAM
2. **Límites de cuota**: Contactar soporte de Firebase
3. **Reglas de seguridad**: Verificar que las reglas permiten la operación

### Contacto de Soporte
- Firebase Support: https://firebase.google.com/support
- Documentación oficial: https://firebase.google.com/docs

## Scripts de Automatización

Los scripts de automatización se encuentran en la carpeta `scripts/` de este repositorio para facilitar el proceso de migración.