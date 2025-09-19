// apps/main/src/ipc/PdfHandlers.ts
// IPC handlers for PDF generation - mirrors pdf_generator.py and multi_offer_generator.py

import { ipcMain, shell } from 'electron';
import { PythonPdfService } from '../services/PythonPdfService';
import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs';

export function registerPdfHandlers() {
  const pdfService = new PythonPdfService();

  // Original PDF Generation handler
  ipcMain.handle('pdf:generate_offer', async (event, projectData, analysisResults, options) => {
    return await pdfService.generateOfferPdf(projectData, analysisResults, options);
  });

  // Standard PDF Generation - uses pdf_generator_cli.py
  ipcMain.handle('pdf:generateStandard', async (event, config) => {
    try {
      console.log('🎯 Starting Standard PDF Generation', config);
      
      const pythonScript = path.join(process.cwd(), 'pdf_generator_cli.py');
      
      // Create temp config file
      const configPath = path.join(process.cwd(), 'temp_pdf_config.json');
      fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
      
      return new Promise((resolve, reject) => {
        const python = spawn('python', [pythonScript, '--config', configPath], {
          cwd: process.cwd(),
          stdio: 'pipe'
        });

        let stdout = '';
        let stderr = '';

        python.stdout.on('data', (data) => {
          stdout += data.toString();
          console.log('📄 PDF Generator Output:', data.toString());
        });

        python.stderr.on('data', (data) => {
          stderr += data.toString();
          console.error('❌ PDF Generator Error:', data.toString());
        });

        python.on('close', (code) => {
          // Cleanup temp file
          if (fs.existsSync(configPath)) {
            fs.unlinkSync(configPath);
          }

          if (code === 0) {
            try {
              const result = JSON.parse(stdout.split('\n').find(line => line.startsWith('{')) || '{}');
              console.log('✅ Standard PDF Generation completed', result);
              resolve(result);
            } catch (parseError) {
              console.error('❌ Failed to parse PDF generator output', parseError);
              resolve({
                success: true,
                message: 'PDF generated successfully',
                stdout: stdout
              });
            }
          } else {
            reject(new Error(`PDF generation failed with code ${code}: ${stderr}`));
          }
        });

        python.on('error', (error) => {
          console.error('❌ Python process error:', error);
          reject(error);
        });
      });
    } catch (error) {
      console.error('❌ Standard PDF Generation error:', error);
      throw error;
    }
  });

  // Multi PDF Generation - uses multi_offer_generator_cli.py
  ipcMain.handle('pdf:generateMulti', async (event, config) => {
    try {
      console.log('🎯 Starting Multi PDF Generation', config);
      
      const pythonScript = path.join(process.cwd(), 'multi_offer_generator_cli.py');
      
      // Create temp config file
      const configPath = path.join(process.cwd(), 'temp_multi_pdf_config.json');
      fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
      
      return new Promise((resolve, reject) => {
        const python = spawn('python', [pythonScript, '--config', configPath], {
          cwd: process.cwd(),
          stdio: 'pipe'
        });

        let stdout = '';
        let stderr = '';

        python.stdout.on('data', (data) => {
          const output = data.toString();
          stdout += output;
          console.log('📄 Multi PDF Generator Output:', output);
          
          // Check for progress updates
          if (output.includes('PROGRESS:')) {
            try {
              const progressLine = output.split('\n').find((line: string) => line.includes('PROGRESS:'));
              if (progressLine) {
                const progressData = JSON.parse(progressLine.replace('PROGRESS:', ''));
                event.sender.send('pdf:multiProgress', progressData);
              }
            } catch (e) {
              console.log('Could not parse progress data:', e);
            }
          }
        });

        python.stderr.on('data', (data) => {
          stderr += data.toString();
          console.error('❌ Multi PDF Generator Error:', data.toString());
        });

        python.on('close', (code) => {
          // Cleanup temp file
          if (fs.existsSync(configPath)) {
            fs.unlinkSync(configPath);
          }

          if (code === 0) {
            try {
              const result = JSON.parse(stdout.split('\n').find(line => line.startsWith('{')) || '{}');
              console.log('✅ Multi PDF Generation completed', result);
              resolve(result);
            } catch (parseError) {
              console.error('❌ Failed to parse Multi PDF generator output', parseError);
              resolve({
                success: true,
                message: 'Multi PDFs generated successfully',
                stdout: stdout
              });
            }
          } else {
            reject(new Error(`Multi PDF generation failed with code ${code}: ${stderr}`));
          }
        });

        python.on('error', (error) => {
          console.error('❌ Python process error:', error);
          reject(error);
        });
      });
    } catch (error) {
      console.error('❌ Multi PDF Generation error:', error);
      throw error;
    }
  });

  // PDF Preview
  ipcMain.handle('pdf:preview', async (event, filePath) => {
    try {
      console.log('👀 Opening PDF preview:', filePath);
      
      if (!fs.existsSync(filePath)) {
        throw new Error(`PDF file not found: ${filePath}`);
      }
      
      await shell.openPath(filePath);
      return { success: true, message: 'PDF preview opened' };
    } catch (error) {
      console.error('❌ PDF preview error:', error);
      throw error;
    }
  });

  // PDF Download
  ipcMain.handle('pdf:download', async (event, { filePath, fileName }) => {
    try {
      console.log('💾 PDF download request:', { filePath, fileName });
      
      if (!fs.existsSync(filePath)) {
        throw new Error(`PDF file not found: ${filePath}`);
      }
      
      // For now, just open the file location
      await shell.showItemInFolder(filePath);
      
      return { 
        success: true, 
        message: 'PDF location opened',
        filePath: filePath
      };
    } catch (error) {
      console.error('❌ PDF download error:', error);
      throw error;
    }
  });

  // Get PDF Generation Status (for future task tracking)
  ipcMain.handle('pdf:getStatus', async (event, taskId) => {
    try {
      console.log('📊 PDF status request:', taskId);
      
      // Placeholder for future task tracking implementation
      return { 
        taskId,
        status: 'completed',
        progress: 100,
        message: 'Task tracking not yet implemented'
      };
    } catch (error) {
      console.error('❌ PDF status error:', error);
      throw error;
    }
  });

  // Cancel PDF Generation (for future task cancellation)
  ipcMain.handle('pdf:cancel', async (event, taskId) => {
    try {
      console.log('❌ PDF cancel request:', taskId);
      
      // Placeholder for future task cancellation implementation
      return { 
        taskId,
        cancelled: true,
        message: 'Task cancellation not yet implemented'
      };
    } catch (error) {
      console.error('❌ PDF cancel error:', error);
      throw error;
    }
  });
}
