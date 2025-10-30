import * as vscode from 'vscode';
import { JavaParser } from '../parser/javaParser';

export class AnalyzerService {
    private parser: JavaParser;

    constructor() {
        this.parser = new JavaParser();
    }

    public async analyzeFile(document: vscode.TextDocument): Promise<void> {
        if (document.languageId !== 'java') {
            return;
        }

        try {
            await this.parser.parse(document.getText());
            vscode.window.showInformationMessage('Analysis completed');
        } catch (error) {
            vscode.window.showErrorMessage('Failed to analyze file: ' + error);
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