import API from "./api";
class JobAPI {
    getOwnedJobs = () => {
        const url = `/job/list_owned_job/`
        return API.get(url);
    }

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
        pCategory: number,
        pTruthQty: number,
        pSharedQty: number,
        pMinQty: number,
        pUnitWage: number,
        pUnitBonus: number,
        pAcceptThreshold: number,
        pBonusThreshold: number,
        pFiles: FileList,
    ) => {
        console.log(pFiles);
        let formData = new FormData();
        formData.append("name", pName);
        formData.append("description", pDesc);
        formData.append("category", pCategory.toString());
        formData.append("truth_qty", pTruthQty.toString());
        formData.append("shared_qty", pSharedQty.toString());
        formData.append("min_qty", pMinQty.toString());
        formData.append("unit_wage", pUnitWage.toString());
        formData.append("unit_bonus", pUnitBonus.toString());
        formData.append("accept_threshold", pAcceptThreshold.toString());
        formData.append("bonus_threshold", pBonusThreshold.toString());
        Array.from(pFiles).forEach(file => {
            formData.append("audio_files", file);
        })
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

    getUnlabeledTruthUnits = (jobId: number) => {
        const url = `/job/${jobId}/truth_unit/`;
        return API.get(url);
    }

    reqAnnotateTruthUnits = (
        jobId: number,
        truthUnits: { id: number; label: string }[]
    ) => {
        const url = `/job/${jobId}/truth_unit/`;
        const body = {
            truth_units: truthUnits.map(unit => {
                return { truth_unit_id: unit.id, label: unit.label }
            }),
        };
        return API.put(url, body);
    }
}

const jobAPI = new JobAPI();
export default jobAPI;