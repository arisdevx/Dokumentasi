export function createTryIt(page) {
  return {
    page,
    env: page?.defaultEnv || "production",
    token: "",
    responseStatus: "",
    responseBody: "",
    isLoading: false,
    query: page?.query?.map((item) => ({ ...item, value: item.example || "" })) || [],
    headers: page?.headers?.map((item) => ({ ...item, value: item.example || "" })) || [],
    requestBody: page?.requestBodyExample || "{\n  \n}",

    get baseUrl() {
      return this.page?.environments?.[this.env] || "";
    },

    addQuery() {
      this.query.push({ name: "", value: "", description: "" });
    },

    addHeader() {
      this.headers.push({ name: "", value: "", description: "" });
    },

    removeQuery(index) {
      this.query.splice(index, 1);
    },

    removeHeader(index) {
      this.headers.splice(index, 1);
    },

    buildUrl() {
      const url = new URL(`${this.baseUrl}${this.page.path}`);
      this.query.forEach((param) => {
        if (param.name && param.value) url.searchParams.set(param.name, param.value);
      });
      return url.toString();
    },

    async send() {
      if (!this.page) return;
      this.isLoading = true;
      this.responseStatus = "";
      this.responseBody = "";

      const headers = {};
      this.headers.forEach((header) => {
        if (header.name && header.value) headers[header.name] = header.value;
      });
      if (this.token) headers.Authorization = this.token.startsWith("Bearer ") ? this.token : `Bearer ${this.token}`;

      const options = { method: this.page.method, headers };
      if (!["GET", "HEAD"].includes(this.page.method) && this.requestBody.trim()) {
        headers["Content-Type"] = headers["Content-Type"] || "application/json";
        options.body = this.requestBody;
      }

      try {
        const response = await fetch(this.buildUrl(), options);
        const text = await response.text();
        this.responseStatus = `${response.status} ${response.statusText}`;
        try {
          this.responseBody = JSON.stringify(JSON.parse(text), null, 2);
        } catch {
          this.responseBody = text;
        }
      } catch (error) {
        this.responseStatus = "Request failed";
        this.responseBody = error.message;
      } finally {
        this.isLoading = false;
      }
    }
  };
}
