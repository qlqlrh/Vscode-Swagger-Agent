import * as vscode from 'vscode';
import { JavaParser } from '../parser/javaParser';
import { EndpointProvider } from '../views/endpointProvider';

export class AnalyzerService {
    private parser: JavaParser;
    private provider?: EndpointProvider;

    constructor(provider?: EndpointProvider) {
        this.parser = new JavaParser();
        this.provider = provider;
    }

    public async analyzeFile(document: vscode.TextDocument): Promise<void> {
        if (document.languageId !== 'java') {
            return;
        }

        try {
            const result = await this.parser.parse(document.uri.fsPath);
            // Log result, update provider if available, and show notification
            console.log('Extractor result:', JSON.stringify(result, null, 2));
            if (this.provider) {
                try {
                    this.provider.updateFromExtractor(result);
                } catch (e) {
                    console.error('Failed to update provider', e);
                }
            }
            vscode.window.showInformationMessage('Analysis completed');
        } catch (error: any) {
            console.error('Analyze error:', error);
            vscode.window.showErrorMessage('Failed to analyze file: ' + (error.message || String(error)));
        }
    }

    public async generateAnnotations(document: vscode.TextDocument): Promise<void> {
        if (document.languageId !== 'java') {
            return;
        }

        try {
            // TODO: Implement annotation generation using GitHub Copilot API
            vscode.window.showInformationMessage('Annotation generation not implemented yet');
        } catch (error) {
            vscode.window.showErrorMessage('Failed to generate annotations: ' + error);
        }
    }
}