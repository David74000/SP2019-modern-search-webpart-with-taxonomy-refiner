import { IRefinementFilter, IRefinementValue } from "../../../../../../../models/ISearchResult";

//DV
import {ITerm} from "@pnp/sp-taxonomy";


interface IBaseRefinerTemplateState {

    /**
     * The current selected values for the refiner 
     */
    refinerSelectedFilterValues: IRefinementValue[];

    /**
     * Value on which refinement values will be filtered
     */
    valueFilter?: string;

    //DV (used in TaxonomyTemplate)
    allTerms?: ITerm[];
    isTaxLoaded?: boolean;
    reloadTreeview?: string;
} 

export default IBaseRefinerTemplateState;