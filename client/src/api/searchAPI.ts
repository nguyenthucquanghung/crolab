import { SearchType } from "../utils/enumerates";
import axios from "axios";
class SearchAPI {
    advanceSearch = (
        esId: string,
        searchContent: string,
        searchType: SearchType,
        minScore: number,
        page: number
    ) => {
        const esReqBody = searchType === SearchType.SearchAllFields ? {
            query: {
                function_score: {
                    query: {
                        query_string: {
                            query: searchContent,
                        },
                    },
                    min_score: minScore,
                }
            },
            size: 10,
            from: page * 10,
        } : {
            query: {
                function_score: {
                    query: {
                        match: {
                            title: searchContent,
                        },
                    },
                    min_score: minScore,
                }
            },
            size: 10,
            from: page * 10,
        };
        const url = `http://52.221.198.189:9200/${esId}/_search`;
        return axios.post(url, esReqBody);
    }
}

const searchAPI = new SearchAPI();
export default searchAPI;