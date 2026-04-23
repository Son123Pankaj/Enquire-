import Api from "./api";

export const getSchedules = async () => {
  const res = await Api.get("schedules");
  return res.data?.schedule || [];
};

export const createSchedule = async (data) => {
  const res = await Api.post("schedules", data);
  return res.data;
};

export const updateSchedule = async (id, data) => {
  const res = await Api.patch(`schedules/${id}`, data);
  return res.data;
};

export const deleteSchedule = async (id) => {
  const res = await Api.delete(`schedules/${id}`);
  return res.data;
};
