// Fetch Wrapper

const wfetch = (url: string) => {
    return fetch(url)
    .then((res) => res.json())
}

export default wfetch;