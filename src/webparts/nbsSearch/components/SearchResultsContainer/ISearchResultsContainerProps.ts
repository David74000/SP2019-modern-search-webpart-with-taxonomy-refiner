import ISearchService from '../../../../services/SearchService/ISearchService';
import ITaxonomyService from '../../../../services/TaxonomyService/ITaxonomyService';
import { DisplayMode } from '@microsoft/sp-core-library';
import { TemplateService } from '../../../../services/TemplateService/TemplateService';
import ISortableFieldConfiguration from '../../../../models/ISortableFieldConfiguration';
import { ISearchResultType } from '../../../../models/ISearchResultType';
import {ICustomTemplateFieldValue} from '../../../../services/ResultService/ResultService';
import SearchResultsOperationCallback from '../../../../models/SearchResultsOperationCallback';
import ResultsLayoutOption from '../../../../models/ResultsLayoutOption';
import { ISortFieldConfiguration } from '../../../../models/ISortFieldConfiguration';
import { IPagingSettings } from '../../../../models/IPagingSettings';
import { ISuggestionProviderInstance } from '../../../../services/ExtensibilityService/ISuggestionProviderInstance';
import { IRefinementFilter } from "../../../../models/ISearchResult";
import IRefinerConfiguration from "../../../../models/IRefinerConfiguration";
import RefinersLayoutOption from "../../../../models/RefinersLayoutOptions";
import IUserService from '../../../../services/UserService/IUserService';
import { WebPartContext } from '@microsoft/sp-webpart-base';

interface ISearchResultsContainerProps {

    /**
     * The search data provider instance
     */
    searchService: ISearchService;

    /**
     * The taxonomy data provider instance
     */
    taxonomyService: ITaxonomyService;

    /**
     * The search query keywords
     */
    queryKeywords: string;

    /**
     * The managed properties used as default sort fields for the query
     */
    sortList: ISortFieldConfiguration[];

    /**
     * The managed properties used as sortable fields for the query
     */
    sortableFields: ISortableFieldConfiguration[];

    /**
     * Show the result count and entered keywords
     */
    showResultsCount: boolean;

    /**
     * Show nothing if no result
     */
    showBlank: boolean;

    /**
     * The current display mode of Web Part
     */
    displayMode: DisplayMode;

    /**
     * The template helper instance
     */
    templateService: TemplateService;

    /**
     * The template raw content to display
     */
    templateContent: string;

    /**
     * Template parameters from Web Part property pane
     */
    templateParameters: { [key:string]: any };

    /**
     * The site server relative url for the current Site
     */
    siteServerRelativeUrl: string;

    /**
     * The web server relative url for the current Web
     */
    webServerRelativeUrl: string;

    /**
     * The name of the current ui culture
     */
    currentUICultureName: string;

    /**
     * The configured result types
     */
    resultTypes: ISearchResultType[];

    /**
     * The name of the CustomAction that should render this data.
     */
    rendererId: string;

    /**
     * The data passing service for custom action renderers
     */
    useCodeRenderer: boolean;
    customTemplateFieldValues:  ICustomTemplateFieldValue[];

    /**
     * Web Parts localized strings
     */
    strings: INbsSearchWebPartStrings;

    /**
     * Enables taxonomy terms fro filters and results metadata
     */
    enableLocalization: boolean;

    /**
     * Handler method when search results are updated
     */
    onSearchResultsUpdate: SearchResultsOperationCallback;

    /*
     * The selected page to show for the search results
     */
    selectedPage: number;

    /**
     * The current selected layout
     */
    selectedLayout: ResultsLayoutOption;

    /**
     * The Web Part paging
     */
    pagingSettings: IPagingSettings;

    /**
     * The Web Part instance id
     */
    instanceId: string;
    /**
     * Search box
     */
    useSearchBox: boolean;
    enableQuerySuggestions: boolean;
    placeholderText: string;
    suggestionProviders: ISuggestionProviderInstance<any>[];
    domElement: HTMLElement;
    /**
     * Search refiners
     */
    defaultSelectedRefinementFilters: IRefinementFilter[];
    refinersConfiguration: IRefinerConfiguration[];
    refinersSelectedLayout: RefinersLayoutOption;
    language: string;
    useRefiners: boolean;
    userService: IUserService;
    onRefinersUpdate: (isDirty: boolean, availableRefiners: IRefinementFilter[]) => Promise<void>;
}

export default ISearchResultsContainerProps;
