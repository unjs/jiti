const mod = await import("./data.json", { with: { type: "css" } });

export default mod.default;
