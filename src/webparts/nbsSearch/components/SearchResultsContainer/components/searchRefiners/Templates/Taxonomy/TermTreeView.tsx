import * as React from 'react';
import {
  ITerm,
  ITermData
} from "@pnp/sp-taxonomy";

import { TreeView, ITreeItem,TreeItemActionsDisplayMode,TreeViewSelectionMode  } from "@pnp/spfx-controls-react/lib/TreeView"

export interface ITermTreeViewProps {
    refreshRefinerCallBack(refinerValues:any):void; //return selected items as refiner to parent component
    allTaxoTerms: ITerm[];                          //contains all terms for current refiner termset
    selectedRefiners: any[];                     //store current selected refiners in TreeView (given by the query defined in the parent component)
    currentAvailableRefiners: {                           //store all refiners that are currently available in the query
        RefinementCount: number;
        RefinementName: string;
        RefinementToken: string;
        RefinementValue: string;
    }[];
  }

export interface ITermTreeViewState {
    treeviewSelectedKeys: any[];                   
}

export class TermTreeView extends React.Component<ITermTreeViewProps,any> {

      public constructor(props:any) {
          super(props);
          
          var selectedKeys = [];
          for (var el of this.props.selectedRefiners) {
              //transform GPP|#541482f3-beb2-4c6e-bb7c-b9a3ae38c007 to 541482f3-beb2-4c6e-bb7c-b9a3ae38c007 to be 
              selectedKeys.push(el.RefinementValue.split("|").pop().substring(1));
          }
          this.state = {
            treeviewSelectedKeys: selectedKeys
          };
          this.onTreeItemSelect.bind(this);
          this.props.refreshRefinerCallBack.bind(this);
      }

      public componentDidMount()
      {
          //console.log("TermTreeView:componentDidMount");          
      }

      //from an array of Taxonomy Terms passed as parameter, build a tree that will be readable by TreeView component
      public buildTree(ts: Array<any>): Array<any> {
          var tree = [];
          ts.forEach(term => {
              tree = this.branch(tree, term)
          });
          return tree;
      }


      //recursive function called to the transform termset hierarchy in a tree
      //based on the following blog : https://blog.lsonline.fr/2019/01/13/display-hierarchical-term-sets-to-your-web-part/
      private branch(tree: Array<any>, term: any, node: any = null, i: number = 0): Array<any> {
          //console.log(term);
          var pathOfTerm = term.PathOfTerm.split(';');
          /* Switch level */
          var c = node == null ? tree : node;
          if (i < pathOfTerm.length) { /* Ensure not loop recursive */
              var r = c.find(function (obj) { return obj.text === pathOfTerm[i]; }); /* check if node already exist */
              if (r) { /* If exist */
                  if ((i + 1) == pathOfTerm.length) { /* Update ID if node == current term */
                      r.id = term.Id.replace('/Guid(', '').replace(')/', '');
                      let treeNode = this.InitNode(term);
                      r.label = term.Name;
                      r.key = r.id;
                      if (treeNode)
                      {
                        //r.key = treeNode.key;
                        r.data = treeNode.data;
                        r.disabled = false;
                      }
                  } else { /* recursive children */
                      this.branch(tree, term, r.children, i + 1);
                  }
                 
              } else { /* Not exists, create new node */
                  /* See : https://www.jstree.com/docs/json/ for all specification */
                  var o = { "key":null, "label":null, "data":null, "disabled": true, "text": pathOfTerm[i], "id": null, "children":[] };
                  if ((i + 1) == pathOfTerm.length) { /* If it's a root node or last child, set ID */
                      o.id = term.Id.replace('/Guid(', '').replace(')/', '');
                      let treeNode = this.InitNode(term);
                      o.label = term.Name;
                      o.key = o.id;
                      if (treeNode)
                      {
                        //o.key = treeNode.key;
                        o.data = treeNode.data;
                        o.disabled = false;
                      }
                  } else { /* recursive children */
                      this.branch(tree, term, o.children, i + 1);
                  }
                  c.push(o);
              }
          }
          return c;

      }

      //translate a term to a TreeItem object including key, label and data. Data is used to make the refinement
      public InitNode(currentTerm:ITermData)
      {
        let termWithRefiner = this.isTermInRefiners(currentTerm);
        if (termWithRefiner)
        {
        let treeNode:ITreeItem={
                key: termWithRefiner["RefinementValue"],
                label:termWithRefiner.Name,
                data: {RefinementCount: termWithRefiner["RefinementCount"], 
                    RefinementName: termWithRefiner["RefinementName"], 
                    RefinementToken: termWithRefiner["RefinementToken"], 
                    RefinementValue: termWithRefiner["RefinementValue"]
                }
              }
            return treeNode;
        }
        else return null;

      }

      //verify if the term passed as parameter is found in the currentAvailableRefiners props (test on Id value)
      public isTermInRefiners(currentTerm:ITermData)
      {
            //console.log(this.props.currentAvailableRefiners);
            let filteredRefiners = this.props.currentAvailableRefiners.filter(x=>
              ((x.RefinementValue.indexOf("L0|#") == -1) && (x.RefinementValue.split("|")[1].toString().replace("#","").toString()
              .indexOf(currentTerm.Id.replace("/Guid(","").replace(")/","").toString()) >=0)));
            //console.log(filteredRefiners);
            if(filteredRefiners.length>0)
            {
                let filteredRefiner = filteredRefiners[0];
                currentTerm["RefinementCount"]=filteredRefiner.RefinementCount;
                currentTerm["RefinementName"]=filteredRefiner.RefinementName;
                currentTerm["RefinementToken"]=filteredRefiner.RefinementToken;
                currentTerm["RefinementValue"]=filteredRefiner.RefinementValue;

                return currentTerm;
            }
            else
            {
              return null;
            }
        }


      //triggered when an item is selected in the TreeView
      private onTreeItemSelect(items: ITreeItem[]) {
        let selectedRefiners = [];
        for (let i=0;i<items.length;i++)
        {
          selectedRefiners.push(items[i].data)
        }
        this.props.refreshRefinerCallBack(selectedRefiners); 
      }
      

      private onTreeItemExpandCollapse(item: ITreeItem, isExpanded: boolean) {
        //console.log((isExpanded ? "item expanded: " : "item collapsed: ") + item); 
      }

      //remove the children property for a given object if this property is an empty array ([])
      public removeChildrenPropertyIfEmpty(obj) {
        for (var p in obj) {
          if (obj.hasOwnProperty(p)) {
            if (p == "children") {
              if (obj[p].length == 0){
                delete obj[p];
              }
              else{
                this.removeChildrenPropertyIfEmpty(obj[p]);
              }
            } else if (typeof obj[p] == 'object') {
              this.removeChildrenPropertyIfEmpty(obj[p]);
            }
          }
        }
        return obj;
      }

      //used in sort function to compare property prop between object a and b
      public GetSortOrder(prop) {    
          return function(a, b) {    
              if (a[prop] > b[prop]) {    
                  return 1;    
              } else if (a[prop] < b[prop]) {    
                  return -1;    
              }    
              return 0;    
          }    
      }   


      public render(): React.ReactElement<ITermTreeViewProps> {

          //create array of items that will be used in the TreeView component
          //this array is built by the builTree and branch (recursive) function
          //the array is a copy of all terms fetched from the termSTore, but only
          //terms that are available as refiners for the current query are selectable
          //console.time("buildTree");
          let treeViewData:any[] = this.buildTree(this.props.allTaxoTerms);
          //console.timeEnd("buildTree");

          //console.time("remove children property and sorting treeview data");
          //remove recursively children property if it's an empty array (otherwise, TreeView display an expand icon even if there is no child)
          this.removeChildrenPropertyIfEmpty(treeViewData);
          treeViewData.sort(this.GetSortOrder("label")); //sort treeViewData using property label 
          //console.timeEnd("remove children property and sorting treeview data");
          
          return (
            <div>
                <div>    
                    <div>
                    <TreeView 
                      items={treeViewData}
                      defaultExpanded={false}
                      selectionMode={TreeViewSelectionMode.Multiple}
                      selectChildrenIfParentSelected={true}
                      showCheckboxes={true}
                      treeItemActionsDisplayMode={TreeItemActionsDisplayMode.ContextualMenu}
                      defaultSelectedKeys={this.state.treeviewSelectedKeys}
                      expandToSelected={true}
                      onSelect={ this.onTreeItemSelect.bind(this) }
                      onExpandCollapse={this.onTreeItemExpandCollapse}
                      />
                    </div>
                </div>
            </div>
          );
    }    
}