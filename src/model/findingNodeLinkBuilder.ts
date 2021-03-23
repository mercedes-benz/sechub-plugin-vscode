import * as vscode from 'vscode';
import * as sechubExtension from '../extension';
import * as secHubModel from './sechubModel';
import { FindingNodeReportItem, ReportItem, SecHubReportTreeDataProvider } from '../provider/secHubReportTreeDataProvider';

export class FindingNodeLinkBuilder {

    public buildCWELinkAndOpenInBrowser(findingNode: secHubModel.FindingNode | undefined) {
        const uri = this.buildCWELink(findingNode);
        if (!uri) {
            return;
        }
        vscode.commands.executeCommand("vscode.open", uri);
    }

    public buildCWELink(findingNode: secHubModel.FindingNode | undefined): vscode.Uri | undefined {
        if (!findingNode) {
            return undefined;
        }
        if (!findingNode.cweId) {
            return undefined;
        }
        return vscode.Uri.parse("https://cwe.mitre.org/data/definitions/" + findingNode.cweId + ".html");
    }

    public buildCWEOpenInBrowserCommand(findingNode: secHubModel.FindingNode | undefined): vscode.Command | undefined {
        if (!findingNode) {
            return undefined;
        }
        var uri = this.buildCWELink(findingNode);
        if (!uri) {
            return undefined;
        }
        return {
            title: "Open CWE " + findingNode.cweId + " in browser",
            command: "vscode.open",
            arguments: [uri]
        };
    }
}



