# Firebase Migration Tools (MWS)

Herramientas completas para migrar proyectos Firebase de una cuenta de Google a otra cuenta del mismo proveedor.

## 🚀 Características

- **Migración automatizada**: Scripts para automatizar el proceso de migración
- **Validación completa**: Herramientas para verificar que la migración fue exitosa
- **Actualización de configuración**: Utilities para actualizar archivos de configuración
- **Documentación detallada**: Guías paso a paso y listas de verificación
- **Templates de configuración**: Ejemplos listos para usar

## 📋 Contenido del Repositorio

```
├── FIREBASE_MIGRATION_GUIDE.md     # Guía detallada de migración
├── MIGRATION_CHECKLIST.md          # Lista de verificación completa
├── package.json                    # Configuración y scripts NPM
├── scripts/
│   └── migration/
│       ├── firebase-migrate.sh     # Script principal de migración
│       ├── config-migrator.js      # Actualizador de configuración
│       └── migration-validator.js  # Validador de migración
└── examples/
    └── config-templates/
        ├── firebase-config.js       # Template Web
        ├── google-services.json     # Template Android
        └── GoogleService-Info.plist # Template iOS
```

## 🛠️ Instalación

```bash
# Clonar el repositorio
git clone https://github.com/ferangarita01/mws.git
cd mws

# Instalar dependencias
npm install

# Hacer ejecutables los scripts
chmod +x scripts/migration/*.sh
```

## 📖 Uso Rápido

### 1. Migración Completa Automática

```bash
# Ejecutar el asistente de migración
npm run migrate
```

### 2. Actualizar Configuración

```bash
# Actualizar archivos de configuración en un directorio
npm run update-config update ./src mi-nuevo-proyecto-id

# Generar templates de configuración
npm run update-config template mi-nuevo-proyecto-id ./config-output
```

### 3. Validar Migración

```bash
# Validar que la migración fue exitosa
npm run validate mi-nuevo-proyecto-id ./src
```

## 📚 Documentación Detallada

- **[Guía de Migración Completa](FIREBASE_MIGRATION_GUIDE.md)**: Instrucciones paso a paso
- **[Lista de Verificación](MIGRATION_CHECKLIST.md)**: Checklist completa para no olvidar nada

## ⚡ Scripts Disponibles

| Comando | Descripción |
|---------|-------------|
| `npm run migrate` | Ejecuta el asistente de migración completa |
| `npm run update-config` | Actualiza archivos de configuración |
| `npm run validate` | Valida que la migración fue exitosa |
| `npm run help` | Muestra ayuda sobre comandos disponibles |

## 🔧 Requisitos Previos

- Node.js >= 14.0.0
- Firebase CLI >= 11.0.0
- Google Cloud SDK (recomendado)
- Acceso administrativo a ambas cuentas de Google

### Instalación de Dependencias

```bash
# Instalar Firebase CLI
npm install -g firebase-tools

# Instalar Google Cloud SDK (opcional pero recomendado)
# Seguir instrucciones en: https://cloud.google.com/sdk/docs/install
```

## 📝 Proceso de Migración

1. **Preparación**: Documentar configuración actual y crear respaldos
2. **Creación**: Crear nuevo proyecto Firebase en la cuenta destino
3. **Migración**: Transferir datos, configuración y reglas
4. **Actualización**: Actualizar aplicaciones con nueva configuración
5. **Validación**: Verificar que todo funciona correctamente

## 🚨 Consideraciones Importantes

- **Contraseñas de usuarios**: No se pueden migrar, los usuarios deberán restablecerlas
- **Tokens de acceso**: Se invalidarán y requerirán re-autenticación
- **Analytics**: El historial no se puede migrar
- **Custom Claims**: Se perderán y deberán reconfigurarse

## 🆘 Soporte y Problemas Comunes

### Errores Frecuentes

1. **Permisos insuficientes**: Verificar roles de IAM
2. **Límites de cuota**: Contactar soporte de Firebase
3. **Reglas de seguridad**: Verificar que permiten las operaciones

### Recursos Adicionales

- [Firebase Documentation](https://firebase.google.com/docs)
- [Firebase Support](https://firebase.google.com/support)
- [Google Cloud Console](https://console.cloud.google.com)

## 🤝 Contribuciones

Las contribuciones son bienvenidas. Por favor:

1. Fork el repositorio
2. Crea una rama para tu feature (`git checkout -b feature/nueva-funcionalidad`)
3. Commit tus cambios (`git commit -am 'Agregar nueva funcionalidad'`)
4. Push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Crea un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.

## 🌟 Características Próximas

- [ ] Interfaz web para migración
- [ ] Soporte para migraciones parciales
- [ ] Integración con CI/CD
- [ ] Migración de Extension de Firebase
- [ ] Reportes detallados de migración
