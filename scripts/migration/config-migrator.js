#!/usr/bin/env node

/**
 * Firebase Configuration Migration Utility
 * Automatiza la migración de archivos de configuración de Firebase
 */

const fs = require('fs');
const path = require('path');

// Colores para la consola
const colors = {
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    reset: '\x1b[0m'
};

function log(message, color = 'blue') {
    console.log(`${colors[color]}[${new Date().toISOString()}] ${message}${colors.reset}`);
}

function error(message) {
    log(message, 'red');
}

function success(message) {
    log(message, 'green');
}

function warning(message) {
    log(message, 'yellow');
}

/**
 * Actualiza el project ID en archivos de configuración web de Firebase
 */
function updateWebConfig(filePath, newProjectId) {
    try {
        if (!fs.existsSync(filePath)) {
            warning(`Archivo no encontrado: ${filePath}`);
            return false;
        }

        const content = fs.readFileSync(filePath, 'utf8');
        let config;

        try {
            config = JSON.parse(content);
        } catch (e) {
            // Intentar extraer configuración de un archivo JS
            const configMatch = content.match(/const\s+firebaseConfig\s*=\s*({[\s\S]*?});/);
            if (configMatch) {
                config = JSON.parse(configMatch[1]);
            } else {
                error(`No se pudo parsear la configuración en: ${filePath}`);
                return false;
            }
        }

        // Actualizar project ID y campos relacionados
        const oldProjectId = config.projectId;
        config.projectId = newProjectId;
        config.authDomain = `${newProjectId}.firebaseapp.com`;
        config.storageBucket = `${newProjectId}.appspot.com`;
        config.databaseURL = `https://${newProjectId}-default-rtdb.firebaseio.com/`;

        // Si es un archivo JS, reconstruir el contenido
        let newContent;
        if (filePath.endsWith('.js') || filePath.endsWith('.ts')) {
            newContent = content.replace(
                /const\s+firebaseConfig\s*=\s*{[\s\S]*?};/,
                `const firebaseConfig = ${JSON.stringify(config, null, 2)};`
            );
        } else {
            newContent = JSON.stringify(config, null, 2);
        }

        fs.writeFileSync(filePath, newContent);
        success(`Configuración actualizada en ${filePath}: ${oldProjectId} -> ${newProjectId}`);
        return true;
    } catch (err) {
        error(`Error actualizando ${filePath}: ${err.message}`);
        return false;
    }
}

/**
 * Actualiza google-services.json para Android
 */
function updateAndroidConfig(filePath, newProjectId) {
    try {
        if (!fs.existsSync(filePath)) {
            warning(`Archivo no encontrado: ${filePath}`);
            return false;
        }

        const config = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        
        const oldProjectId = config.project_info.project_id;
        config.project_info.project_id = newProjectId;
        config.project_info.storage_bucket = `${newProjectId}.appspot.com`;
        config.project_info.firebase_url = `https://${newProjectId}-default-rtdb.firebaseio.com/`;

        fs.writeFileSync(filePath, JSON.stringify(config, null, 2));
        success(`Configuración Android actualizada: ${oldProjectId} -> ${newProjectId}`);
        return true;
    } catch (err) {
        error(`Error actualizando configuración Android: ${err.message}`);
        return false;
    }
}

/**
 * Actualiza GoogleService-Info.plist para iOS
 */
function updateIOSConfig(filePath, newProjectId) {
    try {
        if (!fs.existsSync(filePath)) {
            warning(`Archivo no encontrado: ${filePath}`);
            return false;
        }

        let content = fs.readFileSync(filePath, 'utf8');
        
        // Actualizar PROJECT_ID
        content = content.replace(
            /<key>PROJECT_ID<\/key>\s*<string>.*?<\/string>/,
            `<key>PROJECT_ID</key>\n\t<string>${newProjectId}</string>`
        );

        // Actualizar STORAGE_BUCKET
        content = content.replace(
            /<key>STORAGE_BUCKET<\/key>\s*<string>.*?<\/string>/,
            `<key>STORAGE_BUCKET</key>\n\t<string>${newProjectId}.appspot.com</string>`
        );

        // Actualizar DATABASE_URL
        content = content.replace(
            /<key>DATABASE_URL<\/key>\s*<string>.*?<\/string>/,
            `<key>DATABASE_URL</key>\n\t<string>https://${newProjectId}-default-rtdb.firebaseio.com/</string>`
        );

        fs.writeFileSync(filePath, content);
        success(`Configuración iOS actualizada para proyecto: ${newProjectId}`);
        return true;
    } catch (err) {
        error(`Error actualizando configuración iOS: ${err.message}`);
        return false;
    }
}

/**
 * Busca y actualiza archivos de configuración de Firebase en un directorio
 */
function updateFirebaseConfigs(directory, newProjectId) {
    const configFiles = [
        'firebase-config.js',
        'firebase-config.json',
        'firebaseConfig.js',
        'google-services.json',
        'GoogleService-Info.plist'
    ];

    let updatedFiles = 0;

    function searchDirectory(dir) {
        try {
            const files = fs.readdirSync(dir);
            
            for (const file of files) {
                const filePath = path.join(dir, file);
                const stat = fs.statSync(filePath);

                if (stat.isDirectory() && !file.startsWith('.') && file !== 'node_modules') {
                    searchDirectory(filePath);
                } else if (configFiles.includes(file)) {
                    let updated = false;
                    
                    if (file === 'google-services.json') {
                        updated = updateAndroidConfig(filePath, newProjectId);
                    } else if (file === 'GoogleService-Info.plist') {
                        updated = updateIOSConfig(filePath, newProjectId);
                    } else {
                        updated = updateWebConfig(filePath, newProjectId);
                    }
                    
                    if (updated) updatedFiles++;
                }
            }
        } catch (err) {
            warning(`No se pudo acceder al directorio ${dir}: ${err.message}`);
        }
    }

    searchDirectory(directory);
    return updatedFiles;
}

/**
 * Genera un template de configuración para el nuevo proyecto
 */
function generateConfigTemplate(projectId, outputDir = './config-templates') {
    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
    }

    // Configuración Web
    const webConfig = {
        apiKey: "YOUR_API_KEY",
        authDomain: `${projectId}.firebaseapp.com`,
        projectId: projectId,
        storageBucket: `${projectId}.appspot.com`,
        messagingSenderId: "YOUR_SENDER_ID",
        appId: "YOUR_APP_ID",
        databaseURL: `https://${projectId}-default-rtdb.firebaseio.com/`
    };

    fs.writeFileSync(
        path.join(outputDir, 'firebase-config.js'),
        `const firebaseConfig = ${JSON.stringify(webConfig, null, 2)};

export default firebaseConfig;`
    );

    // Template para Android (estructura básica)
    const androidConfig = {
        "project_info": {
            "project_number": "YOUR_PROJECT_NUMBER",
            "project_id": projectId,
            "storage_bucket": `${projectId}.appspot.com`,
            "firebase_url": `https://${projectId}-default-rtdb.firebaseio.com/`
        },
        "client": [
            {
                "client_info": {
                    "mobilesdk_app_id": "YOUR_MOBILE_SDK_APP_ID",
                    "android_client_info": {
                        "package_name": "com.example.yourapp"
                    }
                },
                "oauth_client": [],
                "api_key": [
                    {
                        "current_key": "YOUR_API_KEY"
                    }
                ],
                "services": {
                    "appinvite_service": {
                        "other_platform_oauth_client": []
                    }
                }
            }
        ],
        "configuration_version": "1"
    };

    fs.writeFileSync(
        path.join(outputDir, 'google-services.json'),
        JSON.stringify(androidConfig, null, 2)
    );

    success(`Templates de configuración generados en: ${outputDir}`);
    log(`Recuerda actualizar los valores YOUR_* con los valores reales de tu proyecto Firebase`);
}

// CLI Interface
function main() {
    const args = process.argv.slice(2);
    
    if (args.length < 2) {
        console.log(`
Uso: node config-migrator.js <comando> <argumentos>

Comandos:
  update <directory> <newProjectId>  - Actualiza configuraciones en un directorio
  template <projectId> [outputDir]   - Genera templates de configuración
  
Ejemplos:
  node config-migrator.js update ./src mi-nuevo-proyecto
  node config-migrator.js template mi-nuevo-proyecto ./templates
        `);
        process.exit(1);
    }

    const command = args[0];

    switch (command) {
        case 'update':
            const directory = args[1];
            const newProjectId = args[2];
            
            if (!newProjectId) {
                error('Debes proporcionar el nuevo project ID');
                process.exit(1);
            }

            log(`Actualizando configuraciones en ${directory} para el proyecto ${newProjectId}`);
            const updatedCount = updateFirebaseConfigs(directory, newProjectId);
            success(`Se actualizaron ${updatedCount} archivos de configuración`);
            break;

        case 'template':
            const projectId = args[1];
            const outputDir = args[2] || './config-templates';
            
            log(`Generando templates para el proyecto ${projectId}`);
            generateConfigTemplate(projectId, outputDir);
            break;

        default:
            error(`Comando no reconocido: ${command}`);
            process.exit(1);
    }
}

if (require.main === module) {
    main();
}

module.exports = {
    updateWebConfig,
    updateAndroidConfig,
    updateIOSConfig,
    updateFirebaseConfigs,
    generateConfigTemplate
};