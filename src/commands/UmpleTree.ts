import { TreeDataProvider, TreeItem, ProviderResult, TreeItemCollapsibleState } from "vscode";

class Action extends TreeItem {
    constructor(title: string, command: string) {
        super(title, TreeItemCollapsibleState.None);
        this.command = { command: command, title };
    }
}

class UmpleTree implements TreeDataProvider<Action> {

    onDidChangeTreeData: undefined;
    getTreeItem(element: Action): TreeItem | Thenable<TreeItem> {
        return element;
    }
    getChildren(element?: Action | undefined): ProviderResult<Action[]> {
        return [
            new Action('Generate Umple Code', 'umple.generate'),
            new Action('Compile Umple Code', 'umple.compile'),
            new Action('Lint Umple Code', 'umple.lint'),
            new Action('Display Diagram', 'umple.showGraph')
        ];

    }
}


export const umpleTree = new UmpleTree();