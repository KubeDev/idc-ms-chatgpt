export default class ClientHttp {

    static API_URL: string = window.location.origin
  
    static async get(path: string) {
      const response = await fetch(`/api/${path}`);
      const data = await response.json();
      if (!response.ok) throw new Error(data.message);
      return data;
    }
  
    static async post(path: string, body: any) {
      const response = await fetch(`/api/${path}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message);
      return data;
    }
  
    static async put(path: string, body: any) {
      const response = await fetch(`/api/${path}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message);
      return data;
    }
  
    static async delete(path: string) {
      const response = await fetch(`/api/${path}`, {
        method: "DELETE",
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message);
      return data;
    }
  }
  
  export const fetcher = (path: string) => ClientHttp.get(path);
  