import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import * as sechubModel from '../model/sechubModel';

export class SecHubCallHierarchyTreeDataProvider implements vscode.TreeDataProvider<HierarchyItem> {

  public update(findingNode: sechubModel.FindingNode) {
    this.finding = findingNode;
    this.refresh();
  }

  /* refresh mechanism for tree:*/
  private _onDidChangeTreeData: vscode.EventEmitter<HierarchyItem | undefined | null | void> = new vscode.EventEmitter<HierarchyItem | undefined | null | void>();
  readonly onDidChangeTreeData: vscode.Event<HierarchyItem | undefined | null | void> = this._onDidChangeTreeData.event;

  constructor(private finding: sechubModel.FindingNode | undefined) { }

  private refresh(): void {
    this._onDidChangeTreeData.fire();
  }

  getTreeItem(element: HierarchyItem): vscode.TreeItem {
    return element;
  }

  getChildren(element?: HierarchyItem): Thenable<HierarchyItem[]> {
    if (!this.finding) {
      vscode.window.showInformationMessage('No finding available');
      return Promise.resolve([]);
    }

    if (element) {
      return Promise.resolve(element.children);
    } else {
      return Promise.resolve(
        this.createtHierarchyItems()
      );
    }
  }

  private createtHierarchyItems(): HierarchyItem[] {

    let items: HierarchyItem[] = [];

    let codeCallStackElement: sechubModel.CodeCallStackElement | undefined = this.finding?.code;
    let state: vscode.TreeItemCollapsibleState = codeCallStackElement?.calls ? vscode.TreeItemCollapsibleState.Expanded : vscode.TreeItemCollapsibleState.None;

    if (!(codeCallStackElement)) {
      return items;
    }
    let parent: HierarchyItem | undefined;

    do {
      let item: HierarchyItem = new HierarchyItem(codeCallStackElement, state);
      item.command = {
        command: "sechubCallHierarchyView.selectNode",
        title: "Select Node",
        arguments: [item]
      };
      if (items.length === 0) {
        items.push(item);
      }
      item.contextValue = "callHierarchyitem";
      if (parent) {
        parent.add(item);
      }
      /* go deeper ...*/
      codeCallStackElement = codeCallStackElement.calls;
      parent = item;

    } while (codeCallStackElement);

    return items;

  }

}

/*
calls": {
                  "location": "com/daimler/sechub/domain/administration/project/ProjectJsonInput.java",
                  "line": 36,
                  "column": 37,
                  "source": "\tprivate Optional<ProjectWhiteList> whiteList = Optional.empty();",
                  "relevantPart": "whiteList"
               }
               */

export class HierarchyItem extends vscode.TreeItem {

  readonly children: HierarchyItem[] = [];
  callstackElement: sechubModel.CodeCallStackElement;


  constructor(callstackElement: sechubModel.CodeCallStackElement, state: vscode.TreeItemCollapsibleState
  ) {
    super(callstackElement.relevantPart, state);

    this.description = callstackElement.location;
    this.tooltip = `${this.label}-${this.description}`;
    this.callstackElement = callstackElement;
  }

  iconPath = {
    light: path.join(__filename, '..', '..', 'resources', 'light', 'HierarchyItem.svg'),
    dark: path.join(__filename, '..', '..', 'resources', 'dark', 'HierarchyItem.svg')
  };

  add(child: HierarchyItem) {
    this.children.push(child);
  }
}