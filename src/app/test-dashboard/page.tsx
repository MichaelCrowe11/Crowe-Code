"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function TestDashboard() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const testStripeCheckout = async () => {
    setLoading(true);
    try {
      // Direct API call to test Stripe
      const response = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          planId: "DEVELOPER", // CroweCode Pro
        }),
      });

      const data = await response.json();

      if (data.url) {
        window.location.href = data.url;
      } else {
        alert(`Error: ${JSON.stringify(data)}`);
      }
    } catch (error) {
      alert(`Error: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <h1 className="text-3xl font-bold mb-8">Test Dashboard (No Auth)</h1>

      <div className="space-y-6">
        <div className="bg-gray-900 p-6 rounded-lg">
          <h2 className="text-xl mb-4">Stripe Integration Test</h2>
          <button
            onClick={testStripeCheckout}
            disabled={loading}
            className="px-6 py-3 bg-purple-600 hover:bg-purple-700 rounded-lg disabled:opacity-50"
          >
            {loading ? "Loading..." : "Test Stripe Checkout ($20/mo)"}
          </button>
        </div>

        <div className="bg-gray-900 p-6 rounded-lg">
          <h2 className="text-xl mb-4">Live Stripe Products</h2>
          <ul className="space-y-2 text-sm">
            <li>✅ CroweCode Pro - $20/mo (price_1S9DwwDSZPCbVOighgXMpXNM)</li>
            <li>✅ CroweCode Team - $200/mo (price_1S9DxgDSZPCbVOigKOmPtx8X)</li>
            <li>✅ CroweCode Enterprise+ - $299/mo (price_1S9Dy6DSZPCbVOigkm3Y8DUk)</li>
            <li>✅ Compute Credits - $2/mo (price_1S9E87DSZPCbVOigaw0UDX8S)</li>
          </ul>
        </div>

        <div className="bg-gray-900 p-6 rounded-lg">
          <h2 className="text-xl mb-4">Environment Status</h2>
          <p>Platform: https://crowecode-main.fly.dev</p>
          <p>Webhook: Configured (we_1S9EDZDSZPCbVOigWFisUECh)</p>
          <p>OAuth: Google & GitHub configured</p>
        </div>

        <div className="bg-yellow-900 p-6 rounded-lg">
          <h2 className="text-xl mb-4 text-yellow-400">Known Issue</h2>
          <p className="text-yellow-300">OAuth login redirects back to login page due to session handling issue.</p>
          <p className="text-yellow-300 mt-2">Workaround: Use email registration at /register</p>
        </div>
      </div>
    </div>
  );
}