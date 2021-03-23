import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import * as sechubModel from '../model/sechubModel';

export class SecHubInfoTreeDataProvider implements vscode.TreeDataProvider<InfoItem> {

  constructor(private findingNode: sechubModel.FindingNode | undefined, private callStack: sechubModel.CodeCallStackElement | undefined) { }

  /* refresh mechanism for tree:*/
  private _onDidChangeTreeData: vscode.EventEmitter<InfoItem | undefined | null | void> = new vscode.EventEmitter<InfoItem | undefined | null | void>();
  readonly onDidChangeTreeData: vscode.Event<InfoItem | undefined | null | void> = this._onDidChangeTreeData.event;
  static cweIdKey: string = "CWE-ID:";

  private refresh(): void {
    this._onDidChangeTreeData.fire();
  }

  getTreeItem(element: InfoItem): vscode.TreeItem {
    return element;
  }

  getChildren(element?: InfoItem): Thenable<InfoItem[]> {
    if (!this.callStack) {
      vscode.window.showInformationMessage('No call stack data available');
      return Promise.resolve([]);
    }

    if (element) {
      if (element instanceof MetaDataInfoItem) {
        return Promise.resolve(element.children);
      } else {
        return Promise.resolve([]); // no children at the moment
      }
    } else {
      return Promise.resolve(
        this.getReportItems()
      );
    }
  }


  public update(findingNode: sechubModel.FindingNode | undefined, callStack: sechubModel.CodeCallStackElement) {
    this.findingNode = findingNode;
    this.callStack = callStack;
    this.refresh();
  }


  /**
   * Given the path to package.json, read all its dependencies and devDependencies.
   */
  private getReportItems(): InfoItem[] {
    let rootItems: InfoItem[] = [];
    rootItems.push(new MetaDataInfoItem("Name:", this.findingNode?.name, vscode.TreeItemCollapsibleState.None));
    rootItems.push(new MetaDataInfoItem(SecHubInfoTreeDataProvider.cweIdKey, this.findingNode?.cweId, vscode.TreeItemCollapsibleState.None));
    rootItems.push(new MetaDataInfoItem("Line:", this.callStack?.line, vscode.TreeItemCollapsibleState.None));
    rootItems.push(new MetaDataInfoItem("Column:", this.callStack?.column, vscode.TreeItemCollapsibleState.None));
    rootItems.push(new MetaDataInfoItem("Source:", this.callStack?.source.trim(), vscode.TreeItemCollapsibleState.None));
    return rootItems;
  }

}

export class InfoItem extends vscode.TreeItem {
}

export class MetaDataInfoItem extends InfoItem {
  children: InfoItem[] = [];

  constructor(key: string, value: string | number | undefined, state: vscode.TreeItemCollapsibleState) {
    super(key, state);
    this.description = "" + value;

    if (SecHubInfoTreeDataProvider.cweIdKey === key && (!(value === null))) {
      const uri = vscode.Uri.parse("https://cwe.mitre.org/data/definitions/" + value + ".html");
      this.command = {
        title: "Open CWE-ID:" + value+ " in browser",
        command: "vscode.open",
        arguments: [uri]
      };
      this.tooltip="Click to open CWE description in browser";
    }
  }

}

export class FindingMetaInfoItem extends InfoItem {
  readonly findingNode: sechubModel.FindingNode;

  constructor(findingNode: sechubModel.FindingNode
  ) {
    super(findingNode.id + " - " + findingNode.severity, vscode.TreeItemCollapsibleState.None);

    this.description = findingNode.name;
    this.tooltip = `${this.label}-${this.description}`;
    this.findingNode = findingNode;
  }


  iconPath = {
    light: path.join(__filename, '..', '..', 'resources', 'light', 'ReportItem.svg'),
    dark: path.join(__filename, '..', '..', 'resources', 'dark', 'ReportItem.svg')
  };
}
