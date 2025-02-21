export const processHCPCSData = (hcpcsData) => {
  if (!hcpcsData || hcpcsData.length === 0) {
    console.warn("No HCPCS data found in response.");
    return [];
  }

  return hcpcsData.map((entry) => ({
    code: entry.hcpcs_code || "Unknown",
    description: entry.hcpcs_description || "No description available",
  }));
};
