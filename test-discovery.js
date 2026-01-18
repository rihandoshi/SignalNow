
const { getOrgContributors, getRepoContributors } = require('./src/lib/github-api.js');

async function test() {
    console.log("Testing Org: postgresql");
    const orgRes = await getOrgContributors('postgresql', 'database');
    console.log(`Org 'postgresql' result count: ${orgRes.length}`);

    console.log("\nTesting Org: postgres (Empty Goal)");
    const orgResValid = await getOrgContributors('postgres', '');
    console.log(`Org 'postgres' result count: ${orgResValid.length}`);
    if (orgResValid.length > 0) {
        console.log("Sample candidate:", orgResValid[0].username, orgResValid[0].heuristic_score);
    }
}

test();
