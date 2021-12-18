import API from "./api";
class JobAPI {
    getAllJobs = () => {
        const url = '/job/';
        return API.get(url);
    };
    getJobDetail = (id: string) => {
        const url = `/job/${id}`;
        return API.get(url);
    };
    createJob = (
        pName: string,
        pDesc: string,
        pK: string,
        pB1: string,
        pNoSeqHL: string,
        pMinTabRowHL: string,
        pMaxTabRowHL: string,
        pEsId: string,
        pFile: any,
    ) => {
        let formData = new FormData();
        formData.append("file", pFile);
        formData.append("name", pName);
        formData.append("description", pDesc);
        formData.append("k", pK);
        formData.append("b1", pB1);
        formData.append("num_sequence_highlight", pNoSeqHL);
        formData.append("min_table_row_highlight", pMinTabRowHL);
        formData.append("max_table_row_highlight", pMaxTabRowHL);
        formData.append("es_id", pEsId);
        const url = "/job/";
        return API.post(
            url,
            formData,
            {
                headers: {
                    "Content-Type": "multipart/form-data",
                }
            }
        );
    };
}

const jobAPI = new JobAPI();
export default jobAPI;