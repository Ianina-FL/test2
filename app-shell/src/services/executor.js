const fs = require('fs').promises;
const path = require('path');
const AdmZip = require('adm-zip');
const { ESLint } = require('eslint');
const { exec } = require('child_process');
const util = require('util');
const execAsync = util.promisify(exec);

module.exports = class ExecutorService {
  static async readProjectTree (directoryPath) {
    const paths = {
      frontend: '../../../frontend',
      backend: '../../../backend',
      default: '../../../'
    };

    try {
      const publicDir = path.join(__dirname, paths[directoryPath] || directoryPath || paths.default);
      return await getDirectoryTree(publicDir);
    } catch (error) {
      console.error('Error reading directory:', error);
      throw error;
    }
  }

  static async readFileContents(filePath) {
    try {
      const fullPath = path.join(__dirname, filePath);
      const content = await fs.readFile(fullPath, 'utf8');
      const lines = content.split('\n');

      const lineObject = {};
      lines.forEach((line, index) => {
        lineObject[index + 1] = line;
      });

      return lineObject;
    } catch (error) {
      console.error('Error reading file:', error);
      throw error;
    }
  }

  static async readFileHeader(filePath, N = 30) {
    try {
      const fullPath = path.join(__dirname, filePath);
      const content = await fs.readFile(fullPath, 'utf8');
      const lines = content.split('\n');

      if (lines.length < N) {
        return { error: `File has less than ${N} lines` };
      }

      const headerLines = lines.slice(0, Math.min(50, lines.length));

      const lineObject = {};
      headerLines.forEach((line, index) => {
        lineObject[index + 1] = line;
      });

      return lineObject;
    } catch (error) {
      console.error('Error reading file header:', error);
      throw error;
    }
  }

  static async readFileLineContext(filePath, lineNumber, windowSize) {
    try {
      const fullPath = path.join(__dirname, filePath);
      const content = await fs.readFile(fullPath, 'utf8');
      const lines = content.split('\n');

      const start = Math.max(0, lineNumber - windowSize);
      const end = Math.min(lines.length, lineNumber + windowSize + 1);

      const contextLines = lines.slice(start, end);

      const lineObject = {};
      contextLines.forEach((line, index) => {
        lineObject[start + index + 1] = line;
      });

      return lineObject;
    } catch (error) {
      console.error('Error reading file line context:', error);
      throw error;
    }
  }

  static async writeFile(filePath, fileContents, N = 500) {
    try {
      const fullPath = path.join(__dirname, filePath);
      const content = await fs.readFile(fullPath, 'utf8');
      const lines = content.split('\n');

      if (lines.length >= N) {
        throw new Error(`File has ${lines.length} lines, which is not less than ${N}`);
      }

      await fs.writeFile(fullPath, fileContents, 'utf8');

      return true;
    } catch (error) {
      console.error('Error writing file:', error);
      throw error;
    }
  }

  static async updateFileLine(filePath, lineNumber, newText) {
    try {
      const fullPath = path.join(__dirname, filePath);
      const content = await fs.readFile(fullPath, 'utf8');
      const lines = content.split('\n');

      if (lineNumber < 1) {
        throw new Error('Invalid line number');
      }

      lines[lineNumber] = newText;

      await fs.writeFile(fullPath, lines.join('\n'), 'utf8');

      return true;
    } catch (error) {
      console.error('Error updating file line:', error);
      throw error;
    }
  }

  static async updateFileSlice(filePath, startLine, endLine, newCode) {
    try {
      const fullPath = path.join(__dirname, filePath);
      const content = await fs.readFile(fullPath, 'utf8');
      const lines = content.split('\n');

      if (startLine < 0 || endLine >= lines.length || startLine > endLine) {
        throw new Error('Invalid line range');
      }

      lines.splice(startLine, endLine - startLine + 1, ...newCode.split('\n'));

      await fs.writeFile(fullPath, lines.join('\n'), 'utf8');

      return true;
    } catch (error) {
      console.error('Error updating file slice:', error);
      throw error;
    }
  }

  static async validateFile(filePath) {
    try {
      const fullPath = path.join(__dirname, filePath);
      const eslint = new ESLint({ overrideConfigFile: path.resolve(__dirname, '../../../app-shell/.eslintrc.cjs') });

      const results = await eslint.lintFiles([fullPath]);

      const formatter = await eslint.loadFormatter('stylish');
      const resultText = formatter.format(results);

      return resultText;
    } catch (error) {
      console.error('Error validating file:', error);
      throw error;
    }
  }

  static async replaceFileContent(filePath, oldCode, newCode) {
    try {
      const fullPath = path.join(__dirname, filePath);
      const content = await fs.readFile(fullPath, 'utf8');

      const updatedContent = content.replace(oldCode, newCode);

      await fs.writeFile(fullPath, updatedContent, 'utf8');

      return { success: true };
    } catch (error) {
      console.error('Error replacing file content:', error);
      return { error: error.message };
    }
  }

  static async waitForFilesWrite(directoryPath, timeout = 5000) {
    const startTime = Date.now();

    while (Date.now() - startTime < timeout) {
      try {
        // Проверяем, что файлы не заблокированы и доступны для чтения
        const files = await fs.readdir(directoryPath, { withFileTypes: true });
        let allFilesAccessible = true;

        for (const file of files) {
          if (file.isFile()) {
            try {
              const filePath = path.join(directoryPath, file.name);
              await fs.access(filePath, fs.constants.R_OK | fs.constants.W_OK);
            } catch {
              allFilesAccessible = false;
              break;
            }
          }
        }

        if (allFilesAccessible) {
          return true;
        }
      } catch (error) {
        console.error('Error checking files:', error);
      }

      // Ждем немного перед следующей попыткой
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    throw new Error('Timeout waiting for files to be written');
  }

  static async validateBackendFiles(backendPath) {
    try {
      // Check for syntax errors
      await execAsync(`node --check ${backendPath}/src/index.js`);

      // Try to run the code in a test environment
      const testProcess = exec(
          'NODE_ENV=test node -e "try { require(\'./src/index.js\') } catch(e) { console.error(e); process.exit(1) }"',
          { cwd: backendPath }
      );

      return new Promise((resolve) => {
        let output = '';
        let error = '';

        testProcess.stdout.on('data', (data) => {
          output += data;
        });

        testProcess.stderr.on('data', (data) => {
          error += data;
        });

        testProcess.on('close', (code) => {
          if (code === 0) {
            resolve({ valid: true });
          } else {
            resolve({
              valid: false,
              error: error || output
            });
          }
        });

        // Timeout on validation
        setTimeout(() => {
          testProcess.kill();
          resolve({
            valid: true,
            warning: 'Validation timeout, but no immediate errors found'
          });
        }, 5000);
      });
    } catch (error) {
      return {
        valid: false,
        error: error.message
      };
    }
  }

  static async createBackup(ROOT_PATH) {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupDir = path.join(ROOT_PATH, 'backups', timestamp);

    try {
      await fs.mkdir(path.join(ROOT_PATH, 'backups'), { recursive: true });
      await execAsync(`cp -r ${ROOT_PATH}/backend ${backupDir}`);
      console.log('Backup created at:', backupDir);
      return backupDir;
    } catch (error) {
      console.error('Error creating backup:', error);
      throw error;
    }
  }

  static async restoreFromBackup(backupDir, ROOT_PATH) {
    try {
      console.log('Restoring from backup:', backupDir);
      await execAsync(`rm -rf ${ROOT_PATH}/backend/*`);
      await execAsync(`cp -r ${backupDir}/* ${ROOT_PATH}/backend/`);
      return true;
    } catch (error) {
      console.error('Error restoring from backup:', error);
      throw error;
    }
  }

  static async updateProjectFilesFromScheme(zipFilePath) {
    const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
    const ROOT_PATH = path.join(__dirname, '../../../');
    let backupDir = null;

    try {
      // Check file size
      await fs.access(zipFilePath);
      const stats = await fs.stat(zipFilePath);
      if (stats.size > MAX_FILE_SIZE) {
        throw new Error('File size exceeds limit');
      }

      // Create a backup
      console.log('Creating backup...');
      backupDir = await this.createBackup(ROOT_PATH);

      // Unzip the file
      console.log('Extracting files...');
      const zip = new AdmZip(zipFilePath);
      zip.extractAllTo(ROOT_PATH, true);

      // Wait for files to be written
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Check that files are accessible
      console.log('Validating updated files...');
      const validation = await this.validateBackendFiles(path.join(ROOT_PATH, 'backend'));

      if (!validation.valid) {
        console.error('Validation failed:', validation.error);
        if (backupDir) {
          console.log('Restoring from backup...');
          await this.restoreFromBackup(backupDir, ROOT_PATH);
        }
        return {
          success: false,
          error: 'Code validation failed, restored from backup',
          details: validation.error
        };
      }

      if (validation.warning) {
        console.warn('Validation warning:', validation.warning);
      }

      // Restart the backend
      console.log('Restarting backend service...');
      const { stdout } = await execAsync('ps -o pid,args | grep "[n]odemon"');
      if (stdout) {
        const pid = stdout.trim().split(/\s+/)[0];
        await execAsync(`kill -SIGUSR2 ${pid}`);
      }

      return {
        success: true,
        message: 'Project updated and backend restarted',
        backupDir,
        warning: validation.warning
      };

    } catch (error) {
      console.error('Error in update process:', error);

      // Try to restore from backup
      if (backupDir) {
        try {
          console.log('Error occurred, restoring from backup...');
          await this.restoreFromBackup(backupDir, ROOT_PATH);
          return {
            success: false,
            error: error.message,
            restored: true
          };
        } catch (restoreError) {
          return {
            success: false,
            error: `${error.message}. Restore failed: ${restoreError.message}`,
            restored: false
          };
        }
      }

      return { error: error.message };
    }
  }
};

async function getDirectoryTree(dirPath) {
  const entries = await fs.readdir(dirPath, { withFileTypes: true });
  const result = {};

  for (const entry of entries) {
    const fullPath = path.join(dirPath, entry.name);

    if (entry.isDirectory() && (entry.name === 'node_modules' || entry.name === 'app-shell')) {
      continue;
    }

    const relativePath = fullPath.replace('/app', '');

    if (entry.isDirectory()) {
      const subTree = await getDirectoryTree(fullPath);
      Object.keys(subTree).forEach(key => {
        result[key.replace('/app', '')] = subTree[key];
      });
    } else {
      const fileContent = await fs.readFile(fullPath, 'utf8');
      const lineCount = fileContent.split('\n').length;
      result[relativePath] = lineCount;
    }
  }

  return result;
}