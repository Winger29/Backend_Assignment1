const token = localStorage.getItem('token');
let userID = "";

if (token) {
    try { 
        const split = JSON.parse(atob(token.split('.')[1]));
        userID = split.id;
    } catch(e) {
        console.error("Invalid token, check if its correct");
    }
} else {
    console.log("No token found");
}


async function getGroupByUserID() {
    try {
        const response = await fetch(`/api`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        return data;
    } catch (error) {
        console.error("Error fetching group by user ID:", error);
        throw error;
    }
}
