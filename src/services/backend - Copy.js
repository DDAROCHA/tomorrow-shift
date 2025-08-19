import Backendless from "backendless";

// Initialize Backendless once
const APP_ID = "F405D13E-0A77-400C-ACBE-8146E8285936";
const API_KEY = "BC70880E-34E2-4992-AB6C-C87592ED3A5B";

Backendless.initApp(APP_ID, API_KEY);

// Export the "Lista" table for reuse
export const Lista = Backendless.Data.of("Lista");

// Helper functions (optional, for cleaner Home.jsx)
export async function getTasks() {
  return await Lista.find();
}

export async function saveTask(task) {
  return await Lista.save(task);
}

export async function deleteTask(id) {
  return await Lista.remove(id);
}
