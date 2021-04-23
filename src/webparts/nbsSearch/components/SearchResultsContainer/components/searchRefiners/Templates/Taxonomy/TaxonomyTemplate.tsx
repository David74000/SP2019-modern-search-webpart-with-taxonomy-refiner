import * as React from "react";
import IBaseRefinerTemplateProps from '../IBaseRefinerTemplateProps';
import IBaseRefinerTemplateState from '../IBaseRefinerTemplateState';
import { IRefinementValue, RefinementOperator } from "../../../../../../../../models/ISearchResult";
//import { Checkbox } from 'office-ui-fabric-react/lib/Checkbox';
//import { Text } from '@microsoft/sp-core-library';
import { Link } from 'office-ui-fabric-react/lib/Link';
import * as strings from 'NbsSearchWebPartStrings';
import * as update from 'immutability-helper';
import { TextField } from "office-ui-fabric-react";
import { ITreeItem} from "@pnp/spfx-controls-react/lib/TreeView";
import {TermTreeView} from './TermTreeView';
//CSS
import styles from './TaxonomyTemplate.module.scss';

import {
    taxonomy,
    ITermStore,
    ITerm,
    ITermSet
  } from "@pnp/sp-taxonomy";

//DV : this class is based on the CheckboxTemplate and used to display refiner as taxonomy treeview
export default class TaxonomyTemplate extends React.Component<IBaseRefinerTemplateProps, IBaseRefinerTemplateState> {

    private _operator: RefinementOperator;

    public constructor(props: IBaseRefinerTemplateProps) {
        super(props);

        this.state = {
            refinerSelectedFilterValues: [],
            isTaxLoaded: false,
            reloadTreeview: new Date().toLocaleTimeString()
        };

        this._applyFilters = this._applyFilters.bind(this);
        this._clearFilters = this._clearFilters.bind(this);
        this._onValueFilterChanged = this._onValueFilterChanged.bind(this);
        this._isFilterMatch = this._isFilterMatch.bind(this);
        this._clearValueFilter = this._clearValueFilter.bind(this);

        this._getSelectedRefinersFromTreeview = this._getSelectedRefinersFromTreeview.bind(this);

        // get all terms from a given termSetID and store it in local state
        let currentTermSet = this.GetTermSetIDFromSearch();
        let termSetID = currentTermSet[0].RefinementValue.split("|")[1].toString().replace("#","")
        this.GetDataFromTerm(termSetID);
    }


    public render() {

        let disableButtons = false;

        //DV
        //var ischeck = (this.state.refinerSelectedFilterValues.length == 1 ? true : false)
        //DV

        if ((this.props.selectedValues.length === 0 && this.state.refinerSelectedFilterValues.length === 0)) {
            disableButtons = true;
        }

        return <div className={styles.pnpRefinersTemplateCheckbox}>
            {
                this.props.showValueFilter ?
                    <div className="pnp-value-filter-container">
                        <TextField className="pnp-value-filter" value={this.state.valueFilter} placeholder="Filter" onChanged={(newValue?: string) => { this._onValueFilterChanged(newValue); }} onClick={this._onValueFilterClick} />
                        <Link onClick={this._clearValueFilter} disabled={!this.state.valueFilter || this.state.valueFilter === ""}>Clear</Link>
                    </div>
                    : null
            }
            {
                this.props.isMultiValue && this.props.refinementResult.Values.length > 5 ?

                    <div>
                        <Link
                            onClick={() => { this._applyFilters(this.state.refinerSelectedFilterValues); }}
                            disabled={disableButtons}>{strings.Refiners.ApplyFiltersLabel}
                        </Link>|<Link  onClick={this._clearFilters} disabled={this.state.refinerSelectedFilterValues.length === 0}>{strings.Refiners.ClearFiltersLabel}</Link>
                    </div>

                    : null
            }
            {
                /*this.props.refinementResult.Values.filter(x => { return !this._isFilterMatch(x); }).map((refinementValue: IRefinementValue, j) => {

                    if (refinementValue.RefinementCount === 0) {
                        return null;
                    }
                    let betterValue: string = refinementValue.RefinementValue;
                    if (refinementValue.RefinementValue.indexOf('\n\n') !== -1) {
                        betterValue = refinementValue.RefinementValue.split('\n\n')[0].trim();
                    }
                    //console.log (betterValue);
                    //betterValue = "test2";
                    return (
                        <Checkbox
                            styles={{
                                root: {
                                    padding: 10
                                }
                            }}
                            key={j}
                            checked={this._isValueInFilterSelection(refinementValue)}
                            disabled={this.state.refinerSelectedFilterValues.length > 0 && !this._isValueInFilterSelection(refinementValue) && !this.props.isMultiValue && refinementValue.RefinementName !== 'Size'}
                            label={Text.format(betterValue + ' ({0})', refinementValue.RefinementCount)}
                            onChange={(ev, checked: boolean) => {
                                checked ? this._onFilterAdded(refinementValue) : this._onFilterRemoved(refinementValue);
                            }} />
                    );
                })DV*/
            }
            {
                (this.state.isTaxLoaded ? 
                <TermTreeView key={this.state.reloadTreeview} allTaxoTerms={this.state.allTerms} currentAvailableRefiners={this.props.refinementResult.Values} selectedRefiners={this.props.selectedValues} refreshRefinerCallBack={this._getSelectedRefinersFromTreeview}></TermTreeView>
                :
                null)
            }
            
            {
              
                this.props.isMultiValue ?

                    <div>
                        <Link
                            onClick={() => { this._applyFilters(this.state.refinerSelectedFilterValues); }}
                            disabled={disableButtons}>{strings.Refiners.ApplyFiltersLabel}
                        </Link>|<Link onClick={this._clearFilters} disabled={this.state.refinerSelectedFilterValues.length === 0}>{strings.Refiners.ClearFiltersLabel}</Link>
                    </div>

                    : null
            }
        </div>;
    }

    public componentDidMount() {
        // Determine the operator according to multi value setting
        this._operator = this.props.isMultiValue ? RefinementOperator.OR : RefinementOperator.AND;

        // This scenario happens due to the behavior of the Office UI Fabric GroupedList component who recreates child components when a greoup is collapsed/expanded, causing a state reset for sub components
        // In this case we use the refiners global state to recreate the 'local' state for this component
        this.setState({
            refinerSelectedFilterValues: this.props.selectedValues
        });

        
    }

    public componentWillReceiveProps(nextProps: IBaseRefinerTemplateProps) {

        if (nextProps.shouldResetFilters) {
            //when receiving new query in search box, keep current filters applied
            //this._applyFilters(this.state.refinerSelectedFilterValues);
            //DV:in our scenario, we don't want to reset refiner filters when receiving new query in search box
            this.setState({
                refinerSelectedFilterValues: [],
                reloadTreeview: new Date().toLocaleTimeString()
            });
        }
        
        // Remove an arbitrary value from the inner state
        // Useful when the remove filter action is also present in the parent layout component
        if (nextProps.removeFilterValue) {

            const newFilterValues = this.state.refinerSelectedFilterValues.filter((elt) => {
                return elt.RefinementValue !== nextProps.removeFilterValue.RefinementValue;
            });

            this.setState({
                refinerSelectedFilterValues: newFilterValues
            });

            this._applyFilters(newFilterValues);
        }

    }

    /**
     * Applies all selected filters for the current refiner
     */
    private _applyFilters(updatedValues: IRefinementValue[]) {
        this.props.onFilterValuesUpdated(this.props.refinementResult.FilterName, updatedValues, this._operator);
    }

    /**
     * Clears all selected filters for the current refiner
     */
    private _clearFilters() {
        this.setState({
            refinerSelectedFilterValues: []
        });

        this._applyFilters([]);
    }

    /**
     * Checks if an item-object matches the provided refinement value filter value
     * @param item The item-object to be checked
     */
    private _isFilterMatch(item: IRefinementValue): boolean {
        if (!this.state.valueFilter) { return false; }
        const isSelected = this.state.refinerSelectedFilterValues.some(selectedValue => selectedValue.RefinementValue === item.RefinementValue);
        if (isSelected) { return false; }
        return item.RefinementValue.toLowerCase().indexOf(this.state.valueFilter.toLowerCase()) === -1;
    }

    /**
     * Event triggered when a new value is provided in the refinement value filter textfield.
     * @param newvalue The new value provided through the textfield
     */
    private _onValueFilterChanged(newValue: string) {
        this.setState({
            valueFilter: newValue
        });
    }

    /**
     * Clears the filter applied to the refinement values
     */
    private _clearValueFilter() {
        this.setState({
            valueFilter: ""
        });
    }

    /**
     * Prevents the parent group to be colapsed
     * @param event The event that triggered the click
     */
    private _onValueFilterClick(event: React.MouseEvent<HTMLInputElement | HTMLTextAreaElement>) {
        event.stopPropagation();
    }
    
    //passed as props in child component (TreeView) in order to get selected elements and set it to state
    private _getSelectedRefinersFromTreeview = (TermTreeviewDatas) => {
        this.setState({refinerSelectedFilterValues: TermTreeviewDatas});
        if (!this.props.isMultiValue) {
            this._applyFilters(TermTreeviewDatas);
        }
      }

    //get all terms from a given termSetID
    public async GetDataFromTerm(termSetID)
    {
        let  allStore = await taxonomy.termStores.get();
        const currentStore : ITermStore = allStore[0]; 
        let  termSet:ITermSet = await currentStore.getTermSetById(termSetID);
        //let termsetdata:ITermSetData =await termSet.select('Id', 'Name').get();
        var allTerms :ITerm[]= await termSet.terms.get();
  
        this.setState({ allTerms: allTerms, isTaxLoaded: true});
    }

    //read props refinementResult (containing all available taxonomy refiners) and return the ID of termset
    public GetTermSetIDFromSearch()
    {
        return this.props.refinementResult.Values.filter(x=>x.RefinementValue.indexOf("GTSet") >=0);
    }

}
