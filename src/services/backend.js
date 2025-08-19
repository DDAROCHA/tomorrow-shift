import Backendless from "backendless";

// Initialize Backendless once
const APP_ID = "F405D13E-0A77-400C-ACBE-8146E8285936";
const API_KEY = "BC70880E-34E2-4992-AB6C-C87592ED3A5B";

Backendless.initApp(APP_ID, API_KEY);

// Export the "Lista" table for reuse (used in Home)
export const Lista = Backendless.Data.of("Lista");

// Export the "Enviar" table for Page1
export const Enviar = Backendless.Data.of("Enviar");

// ---------------------------
// Helper functions for Lista
// ---------------------------
export async function getTasks() {
  return await Lista.find();
}

export async function saveTask(task) {
  return await Lista.save(task);
}

export async function deleteTask(id) {
  return await Lista.remove(id);
}

// ---------------------------
// Helper functions for Enviar
// ---------------------------
export async function saveEnviar(record) {
  // record = { mail: string, mensaje: string }
  return await Enviar.save(record);
}
