const axios = require("axios");

async function fetchRapidEvents(searchQuery = "Yoga Events") {
  const options = {
    method: 'GET',
    url: 'https://real-time-events-search.p.rapidapi.com/search-events',
    params: {
      query: searchQuery,
      page: '1',
      perPage: '10'
    },
    headers: {
      'X-RapidAPI-Key': 'd53dccc097msh99b884946db7ee6p1d50afjsnd03977a64255',
      'X-RapidAPI-Host': 'real-time-events-search.p.rapidapi.com'
    }
  };

  try { 
    const response = await axios.request(options);
    const rawList = response.data.data;

    const formatted = rawList.map(event => ({
      name: event.name || "No name",
      description: event.description || "No description",
      start_time: event.start_time || "N/A",                // keep as string
      end_time: event.end_time || "N/A",                    // keep as string
      address: event.venue?.full_address || "No address",
      link: event.link || event.url || "#",                  // add link
      date_human_readable: event.date_human_readable || "", // add human-readable date
    }));
    

    return formatted;
  } catch (error) {
    console.error("RapidAPI fetch error:", error.response?.data || error.message);
    throw error;
  }
}

module.exports = { fetchRapidEvents };