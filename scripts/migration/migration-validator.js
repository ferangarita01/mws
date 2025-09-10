#!/usr/bin/env node

/**
 * Firebase Migration Validation Script
 * Valida que la migración de Firebase se haya completado correctamente
 */

const { execSync } = require('child_process');
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
    console.log(`${colors[color]}[VALIDATOR] ${message}${colors.reset}`);
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

class MigrationValidator {
    constructor(projectId) {
        this.projectId = projectId;
        this.validationResults = {
            passed: 0,
            failed: 0,
            warnings: 0,
            details: []
        };
    }

    addResult(test, status, message) {
        this.validationResults.details.push({
            test,
            status,
            message,
            timestamp: new Date().toISOString()
        });

        switch (status) {
            case 'PASS':
                this.validationResults.passed++;
                success(`✓ ${test}: ${message}`);
                break;
            case 'FAIL':
                this.validationResults.failed++;
                error(`✗ ${test}: ${message}`);
                break;
            case 'WARN':
                this.validationResults.warnings++;
                warning(`⚠ ${test}: ${message}`);
                break;
        }
    }

    /**
     * Verifica que Firebase CLI esté configurado correctamente
     */
    validateFirebaseCLI() {
        try {
            const output = execSync('firebase projects:list --json', { encoding: 'utf8' });
            const projects = JSON.parse(output);
            
            const targetProject = projects.find(p => p.projectId === this.projectId);
            
            if (targetProject) {
                this.addResult(
                    'Firebase CLI Access',
                    'PASS',
                    `Acceso confirmado al proyecto ${this.projectId}`
                );
            } else {
                this.addResult(
                    'Firebase CLI Access',
                    'FAIL',
                    `No se puede acceder al proyecto ${this.projectId}`
                );
            }
        } catch (error) {
            this.addResult(
                'Firebase CLI Access',
                'FAIL',
                `Error ejecutando Firebase CLI: ${error.message}`
            );
        }
    }

    /**
     * Verifica que Firestore esté configurado y accesible
     */
    validateFirestore() {
        try {
            // Cambiar al proyecto
            execSync(`firebase use ${this.projectId}`, { encoding: 'utf8' });
            
            // Intentar obtener reglas de Firestore
            const rules = execSync('firebase firestore:rules:get', { encoding: 'utf8' });
            
            if (rules && rules.length > 0) {
                this.addResult(
                    'Firestore Configuration',
                    'PASS',
                    'Firestore está configurado con reglas'
                );
            } else {
                this.addResult(
                    'Firestore Configuration',
                    'WARN',
                    'Firestore configurado pero sin reglas personalizadas'
                );
            }
        } catch (error) {
            this.addResult(
                'Firestore Configuration',
                'FAIL',
                `Error accediendo a Firestore: ${error.message}`
            );
        }
    }

    /**
     * Verifica Storage
     */
    validateStorage() {
        try {
            const rules = execSync('firebase storage:rules:get', { encoding: 'utf8' });
            
            if (rules && rules.length > 0) {
                this.addResult(
                    'Storage Configuration',
                    'PASS',
                    'Storage está configurado con reglas'
                );
            } else {
                this.addResult(
                    'Storage Configuration',
                    'WARN',
                    'Storage configurado pero sin reglas personalizadas'
                );
            }
        } catch (error) {
            this.addResult(
                'Storage Configuration',
                'FAIL',
                `Error accediendo a Storage: ${error.message}`
            );
        }
    }

    /**
     * Verifica Authentication
     */
    validateAuthentication() {
        try {
            // Verificar si Authentication está habilitado
            // Nota: Esto requiere una llamada a la API de Firebase Admin
            this.addResult(
                'Authentication Setup',
                'WARN',
                'Verificación manual requerida: Confirma que Authentication esté configurado en la consola'
            );
        } catch (error) {
            this.addResult(
                'Authentication Setup',
                'FAIL',
                `Error verificando Authentication: ${error.message}`
            );
        }
    }

    /**
     * Verifica Cloud Functions
     */
    validateCloudFunctions() {
        try {
            // Verificar si hay funciones desplegadas
            const output = execSync('firebase functions:list', { encoding: 'utf8' });
            
            if (output.includes('No functions deployed')) {
                this.addResult(
                    'Cloud Functions',
                    'WARN',
                    'No hay funciones desplegadas en el proyecto'
                );
            } else {
                this.addResult(
                    'Cloud Functions',
                    'PASS',
                    'Cloud Functions están desplegadas'
                );
            }
        } catch (error) {
            this.addResult(
                'Cloud Functions',
                'FAIL',
                `Error verificando Cloud Functions: ${error.message}`
            );
        }
    }

    /**
     * Verifica archivos de configuración en el proyecto local
     */
    validateLocalConfiguration() {
        const configFiles = [
            'firebase.json',
            '.firebaserc',
            'firestore.rules',
            'storage.rules'
        ];

        configFiles.forEach(file => {
            if (fs.existsSync(file)) {
                this.addResult(
                    'Local Configuration',
                    'PASS',
                    `Archivo ${file} encontrado`
                );
            } else {
                this.addResult(
                    'Local Configuration',
                    'WARN',
                    `Archivo ${file} no encontrado`
                );
            }
        });
    }

    /**
     * Verifica la configuración en código
     */
    validateCodeConfiguration(directory = './') {
        const configPatterns = [
            'firebase-config.js',
            'firebase-config.json',
            'firebaseConfig.js',
            'google-services.json',
            'GoogleService-Info.plist'
        ];

        let foundConfigs = 0;

        function searchDirectory(dir) {
            try {
                const files = fs.readdirSync(dir);
                
                for (const file of files) {
                    const filePath = path.join(dir, file);
                    const stat = fs.statSync(filePath);

                    if (stat.isDirectory() && !file.startsWith('.') && file !== 'node_modules') {
                        searchDirectory(filePath);
                    } else if (configPatterns.includes(file)) {
                        foundConfigs++;
                        
                        // Verificar que contenga el project ID correcto
                        try {
                            const content = fs.readFileSync(filePath, 'utf8');
                            if (content.includes(this.projectId)) {
                                this.addResult(
                                    'Code Configuration',
                                    'PASS',
                                    `${filePath} contiene el project ID correcto`
                                );
                            } else {
                                this.addResult(
                                    'Code Configuration',
                                    'FAIL',
                                    `${filePath} no contiene el project ID correcto`
                                );
                            }
                        } catch (err) {
                            this.addResult(
                                'Code Configuration',
                                'WARN',
                                `No se pudo verificar el contenido de ${filePath}`
                            );
                        }
                    }
                }
            } catch (err) {
                // Ignorar errores de acceso a directorios
            }
        }

        searchDirectory(directory);

        if (foundConfigs === 0) {
            this.addResult(
                'Code Configuration',
                'WARN',
                'No se encontraron archivos de configuración de Firebase en el código'
            );
        }
    }

    /**
     * Ejecuta todas las validaciones
     */
    async runAllValidations(codeDirectory = './') {
        log(`Iniciando validación de migración para el proyecto: ${this.projectId}`);
        log('='.repeat(60));

        this.validateFirebaseCLI();
        this.validateFirestore();
        this.validateStorage();
        this.validateAuthentication();
        this.validateCloudFunctions();
        this.validateLocalConfiguration();
        this.validateCodeConfiguration(codeDirectory);

        this.printSummary();
        return this.validationResults;
    }

    /**
     * Imprime resumen de resultados
     */
    printSummary() {
        log('='.repeat(60));
        log('RESUMEN DE VALIDACIÓN');
        log('='.repeat(60));

        console.log(`${colors.green}✓ Pruebas exitosas: ${this.validationResults.passed}${colors.reset}`);
        console.log(`${colors.red}✗ Pruebas fallidas: ${this.validationResults.failed}${colors.reset}`);
        console.log(`${colors.yellow}⚠ Advertencias: ${this.validationResults.warnings}${colors.reset}`);

        if (this.validationResults.failed === 0) {
            success('¡Migración validada exitosamente!');
        } else {
            error('Se encontraron problemas en la migración. Revisa los detalles arriba.');
        }

        // Guardar reporte
        this.saveReport();
    }

    /**
     * Guarda reporte de validación
     */
    saveReport() {
        const reportPath = `./migration-validation-${this.projectId}-${Date.now()}.json`;
        
        try {
            fs.writeFileSync(reportPath, JSON.stringify({
                projectId: this.projectId,
                validationDate: new Date().toISOString(),
                summary: {
                    passed: this.validationResults.passed,
                    failed: this.validationResults.failed,
                    warnings: this.validationResults.warnings
                },
                details: this.validationResults.details
            }, null, 2));

            log(`Reporte guardado en: ${reportPath}`);
        } catch (error) {
            warning(`No se pudo guardar el reporte: ${error.message}`);
        }
    }
}

// CLI Interface
function main() {
    const args = process.argv.slice(2);
    
    if (args.length < 1) {
        console.log(`
Uso: node migration-validator.js <projectId> [codeDirectory]

Argumentos:
  projectId      - ID del proyecto Firebase a validar
  codeDirectory  - Directorio donde buscar archivos de configuración (opcional, default: ./)

Ejemplo:
  node migration-validator.js mi-nuevo-proyecto ./src
        `);
        process.exit(1);
    }

    const projectId = args[0];
    const codeDirectory = args[1] || './';

    const validator = new MigrationValidator(projectId);
    validator.runAllValidations(codeDirectory);
}

if (require.main === module) {
    main();
}

module.exports = MigrationValidator;