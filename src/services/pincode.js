export const getAddressByPincode = async (pincode) => {
  const response = await fetch(`https://api.postalpincode.in/pincode/${pincode}`);
  const result = await response.json();
  const firstEntry = Array.isArray(result) ? result[0] : null;
  const firstPostOffice = firstEntry?.PostOffice?.[0];

  if (!firstPostOffice) {
    throw new Error(firstEntry?.Message || "Invalid pincode");
  }

  return {
    city: firstPostOffice.Block || firstPostOffice.Name || "",
    district: firstPostOffice.District || "",
    state: firstPostOffice.State || "",
  };
};
