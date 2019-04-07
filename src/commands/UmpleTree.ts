import { TreeDataProvider, TreeItem, ProviderResult, TreeItemCollapsibleState } from "vscode";

class Action extends TreeItem {
    constructor(title: string, command: string, tooltip?: string) {
        super(title, TreeItemCollapsibleState.None);
        this.command = { command: command, title: title};
        if(tooltip){
            this.tooltip = tooltip;
        }
    }
}

class UmpleTree implements TreeDataProvider<Action> {

    onDidChangeTreeData: undefined;
    getTreeItem(element: Action): TreeItem | Thenable<TreeItem> {
        return element;
    }
    getChildren(element?: Action | undefined): ProviderResult<Action[]> {
        return [
            new Action('Generate code from umple', 'umple.generate'),
            new Action('Compile Umple Code', 'umple.compile', "Compile Umple code to Java and then compile the resulting Java")
        ];

    }
}


export const umpleTree = new UmpleTree();