# Lista de Verificación para Migración de Firebase

## Antes de la Migración

### Preparación
- [ ] Verificar acceso a ambas cuentas de Google (origen y destino)
- [ ] Instalar Firebase CLI (`npm install -g firebase-tools`)
- [ ] Instalar Google Cloud SDK
- [ ] Autenticarse en ambas cuentas
- [ ] Documentar configuración actual del proyecto

### Respaldo
- [ ] Exportar datos de Firestore
- [ ] Respaldar archivos de Storage
- [ ] Exportar configuración de Cloud Functions
- [ ] Guardar reglas de seguridad (Firestore, Storage, Realtime Database)
- [ ] Documentar configuración de Authentication
- [ ] Listar todas las aplicaciones registradas
- [ ] Exportar configuración de Analytics (si aplica)

## Durante la Migración

### Crear Nuevo Proyecto
- [ ] Crear proyecto Firebase en la nueva cuenta
- [ ] Configurar plan de facturación
- [ ] Habilitar servicios necesarios:
  - [ ] Authentication
  - [ ] Firestore
  - [ ] Realtime Database (si aplica)
  - [ ] Storage
  - [ ] Cloud Functions
  - [ ] Analytics (si aplica)

### Migrar Datos
- [ ] Importar datos de Firestore
- [ ] Copiar archivos de Storage
- [ ] Importar datos de Realtime Database (si aplica)
- [ ] Aplicar reglas de seguridad
- [ ] Configurar proveedores de Authentication

### Migrar Configuración
- [ ] Registrar aplicaciones (Web, iOS, Android)
- [ ] Descargar nuevos archivos de configuración
- [ ] Actualizar configuración en el código:
  - [ ] firebase-config.js/json
  - [ ] google-services.json (Android)
  - [ ] GoogleService-Info.plist (iOS)
- [ ] Redespegar Cloud Functions
- [ ] Aplicar configuración de funciones

## Después de la Migración

### Verificación
- [ ] Probar autenticación de usuarios
- [ ] Verificar acceso a Firestore
- [ ] Probar funciones de Storage
- [ ] Ejecutar Cloud Functions
- [ ] Verificar notificaciones push
- [ ] Probar Analytics (si aplica)

### Actualización de Aplicaciones
- [ ] Actualizar aplicaciones móviles con nueva configuración
- [ ] Desplegar aplicaciones web actualizadas
- [ ] Probar funcionalidad crítica
- [ ] Verificar integraciones con terceros

### Limpieza
- [ ] Verificar que no hay referencias al proyecto anterior
- [ ] Actualizar documentación del proyecto
- [ ] Informar al equipo sobre los cambios
- [ ] Actualizar pipelines de CI/CD

## Consideraciones Post-Migración

### Usuarios
- [ ] Comunicar a usuarios sobre posibles interrupciones
- [ ] Proporcionar instrucciones para restablecer contraseñas
- [ ] Monitorear errores de autenticación

### Monitoreo
- [ ] Configurar alertas de error
- [ ] Monitorear métricas de uso
- [ ] Verificar logs de Cloud Functions
- [ ] Revisar costos de facturación

### Seguridad
- [ ] Revisar reglas de seguridad
- [ ] Verificar dominios autorizados
- [ ] Actualizar claves API si es necesario
- [ ] Revisar permisos de IAM

## Herramientas de Este Repositorio

### Scripts Disponibles
- [ ] Ejecutar `npm run migrate` para migración automática
- [ ] Usar `npm run update-config update <directory> <projectId>` para actualizar configuración
- [ ] Ejecutar `npm run validate <projectId>` para validar migración

### Archivos de Configuración
- [ ] Usar templates en `examples/config-templates/`
- [ ] Personalizar valores YOUR_* con datos reales
- [ ] Validar configuración con herramientas incluidas

## Problemas Comunes y Soluciones

### Errores de Permisos
- [ ] Verificar roles de IAM en ambos proyectos
- [ ] Confirmar que el usuario tiene permisos de Owner/Editor

### Datos No Migrados
- [ ] Verificar que los buckets de Storage existen
- [ ] Confirmar que las reglas de Firestore permiten escritura
- [ ] Revisar límites de cuota del nuevo proyecto

### Aplicaciones No Funcionan
- [ ] Verificar que los archivos de configuración están actualizados
- [ ] Confirmar que el Project ID es correcto en el código
- [ ] Revisar que las claves API están configuradas

### Cloud Functions Fallan
- [ ] Verificar que las dependencias están instaladas
- [ ] Confirmar que la configuración de funciones está aplicada
- [ ] Revisar logs de Cloud Functions para errores específicos

---

**Nota**: Esta checklist debe adaptarse según las necesidades específicas de cada proyecto. No todos los elementos pueden aplicar a tu situación particular.