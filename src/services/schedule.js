import Api from "./api";

export const createSchedule = (data) =>
  Api.post("schedule/create", data);

export const getSchedule = () =>
  Api.get("schedule");