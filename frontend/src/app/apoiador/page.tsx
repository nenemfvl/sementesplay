'use client';

import React, { useState } from "react";

export default function Apoiador() {
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [sucesso, setSucesso] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    // Simulate registration success
    setSucesso(true);
  }

  return (
    <main className="min-h-screen bg-gray-50 py-8 px-4 flex flex-col items-center">
      <h1 className="text-3xl font-bold mb-6 text-indigo-700">Cadastro de Apoiador</h1>
      <form
        className="bg-white rounded-lg shadow-md p-8 w-full max-w-md flex flex-col gap-4"
        onSubmit={handleSubmit}
      >
        <label className="font-semibold text-gray-700">Nome</label>
        <input
          type="text"
          className="border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400"
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          required
        />
        <label className="font-semibold text-gray-700">Email</label>
        <input
          type="email"
          className="border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <label className="font-semibold text-gray-700">Senha</label>
        <input
          type="password"
          className="border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400"
          value={senha}
          onChange={(e) => setSenha(e.target.value)}
          required
        />
        <button
          type="submit"
          className="mt-4 px-6 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition-colors font-bold"
        >
          Cadastrar
        </button>
        {sucesso && (
          <div className="mt-4 text-green-600 font-semibold text-center">
            Cadastro realizado com sucesso!
          </div>
        )}
      </form>
      <div className="mt-10 text-center text-gray-500">
        <p>Cadastre-se para apoiar seus streamers favoritos e receber benefícios exclusivos!</p>
      </div>
    </main>
  );
}