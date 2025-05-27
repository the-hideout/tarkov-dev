import APIQuery from '../../modules/api-query.mjs';

class StatusQuery extends APIQuery {
    constructor() {
        super('status');
    }

    async query(options) {
        const query = `
            query TarkovDevStatus {
                status {
                    generalStatus {
                        name
                        message
                        status
                    }
                    messages {
                        time
                        type
                        content
                        solveTime
                    }
                }
            }
        `;
    
        const statusData = await this.graphqlRequest(query);
        
        if (statusData.errors) {
            if (statusData.data) {
                for (const error of statusData.errors) {
                    let badItem = false;
                    if (error.path) {
                        badItem = statusData.data;
                        for (let i = 0; i < 2; i++) {
                            badItem = badItem[error.path[i]];
                        }
                    }
                    console.log(`Error in status API query: ${error.message}`);
                    if (badItem) {
                        console.log(badItem)
                    }
                }
            }
            // only throw error if data wasn't returned
            if (!statusData.data?.status?.messages?.length) {
                return Promise.reject(new Error(statusData.errors[0].message));
            }
        }
    
        return statusData.data.status;
    }
}

const statusQuery = new StatusQuery();

const doFetchStatus = async (options) => {
    return statusQuery.run(options);
};

export default doFetchStatus;
