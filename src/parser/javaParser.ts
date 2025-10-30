import * as path from 'path';
import * as cp from 'child_process';
import * as vscode from 'vscode';

export interface EndpointsInfo {
    controllers: ControllerInfo[];
}

export interface ControllerInfo {
    className: string;
    methods: MethodInfo[];
}

export interface MethodInfo {
    methodName: string;
    // Add other fields as needed
}

export class JavaParser {
    private getJarPath(): string {
        const wf = vscode.workspace.workspaceFolders && vscode.workspace.workspaceFolders[0];
        if (!wf) {
            throw new Error('No workspace folder found');
        }
        // JAR is expected at <workspace>/src/extractor/build/libs/swagger-agent-extractor.jar
        return path.join(wf.uri.fsPath, 'src', 'extractor', 'build', 'libs', 'swagger-agent-extractor.jar');
    }

    /**
     * Run the Java extractor JAR and return parsed JSON result.
     * @param filePath absolute path of the Java file to analyze
     */
    public async parse(filePath: string): Promise<any> {
        const workspaceRoot = vscode.workspace.workspaceFolders && vscode.workspace.workspaceFolders[0].uri.fsPath;
        if (!workspaceRoot) throw new Error('No workspace folder');

        const jarPath = this.getJarPath();
        const targetRelative = path.relative(workspaceRoot, filePath);

        const args = ['-jar', jarPath, workspaceRoot, targetRelative];

        return new Promise((resolve, reject) => {
            const proc = cp.spawn('java', args, { cwd: workspaceRoot });
            let stdout = '';
            let stderr = '';

            proc.stdout.on('data', (chunk) => (stdout += chunk.toString()));
            proc.stderr.on('data', (chunk) => (stderr += chunk.toString()));

            proc.on('error', (err) => reject(err));
            proc.on('close', (code) => {
                if (code !== 0) {
                    return reject(new Error(`Extractor failed (code=${code}): ${stderr}`));
                }

                try {
                    const parsed = JSON.parse(stdout);
                    resolve(parsed);
                } catch (e: any) {
                    reject(new Error('Failed to parse extractor output: ' + e?.message + '\n' + stdout + '\n' + stderr));
                }
            });
        });
    }
}