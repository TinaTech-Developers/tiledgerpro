"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { apiFetch } from "@/lib/api";

const tabs = [
  { id: "profile", label: "Profile" },
  { id: "organization", label: "Organization" },
  { id: "security", label: "Security" },
  { id: "billing", label: "Billing" },
];

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("profile");
  const [org, setOrg] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const organizationId = "dec771e0-60bb-478e-86a0-9bf2f5bb2636";

  // =========================
  // FETCH ORGANIZATION
  // =========================
  const fetchOrganization = async () => {
    try {
      setLoading(true);

      const data = await apiFetch(
        `/api/organization?organizationId=${organizationId}`,
      );

      setOrg(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrganization();
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 p-4 md:p-6">
      {/* HEADER */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Settings</h1>
        <p className="text-sm text-gray-500">
          Manage your account, organization and preferences
        </p>
      </div>

      {/* LOADING STATE */}
      {loading ?
        <div className="bg-white p-6 rounded-xl shadow">
          Loading settings...
        </div>
      : <div className="flex gap-6">
          {/* SIDEBAR */}
          <div className="hidden md:flex flex-col w-56 bg-white rounded-xl shadow p-3 h-fit">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`text-left px-3 py-2 rounded-lg text-sm transition ${
                  activeTab === tab.id ?
                    "bg-black text-white"
                  : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* CONTENT */}
          <div className="flex-1">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-xl shadow p-4 md:p-6"
            >
              {/* PROFILE */}
              {activeTab === "profile" && (
                <div className="space-y-4">
                  <h2 className="text-lg font-semibold text-gray-800">
                    Profile Settings
                  </h2>

                  <input
                    className="border p-2 rounded w-full text-gray-800 border-gray-300 focus:border-gray-500 focus:ring-0"
                    defaultValue={org?.name}
                    placeholder="Full Name"
                  />

                  <input
                    className="border p-2 rounded w-full text-gray-800 border-gray-300 focus:border-gray-500 focus:ring-0   "
                    placeholder="Email"
                  />

                  <button className="bg-black text-white px-4 py-2 rounded">
                    Save Profile
                  </button>
                </div>
              )}

              {/* ORGANIZATION */}
              {activeTab === "organization" && (
                <div className="space-y-4">
                  <h2 className="text-lg font-semibold text-gray-800">
                    Organization Details
                  </h2>

                  <input
                    className="border p-2 rounded w-full text-gray-800 border-gray-300 focus:border-gray-500 focus:ring-0"
                    defaultValue={org?.name}
                    placeholder="Organization Name"
                  />

                  <input
                    className="border p-2 rounded w-full text-gray-800 border-gray-300 focus:border-gray-500 focus:ring-0"
                    defaultValue={org?.email}
                    placeholder="Email"
                  />

                  <input
                    className="border p-2 rounded w-full text-gray-800 border-gray-300 focus:border-gray-500 focus:ring-0"
                    defaultValue={org?.phone}
                    placeholder="Phone"
                  />

                  <button className="bg-black text-white px-4 py-2 rounded">
                    Update Organization
                  </button>
                </div>
              )}

              {/* SECURITY */}
              {activeTab === "security" && (
                <div className="space-y-4">
                  <h2 className="text-lg font-semibold text-gray-800">
                    Security
                  </h2>

                  <input
                    type="password"
                    className="border p-2 rounded w-full text-gray-800 border-gray-300 focus:border-gray-500 focus:ring-0"
                    placeholder="Current Password"
                  />

                  <input
                    type="password"
                    className="border p-2 rounded w-full text-gray-800 border-gray-300 focus:border-gray-500 focus:ring-0"
                    placeholder="New Password"
                  />

                  <button className="bg-red-600 text-white px-4 py-2 rounded">
                    Change Password
                  </button>
                </div>
              )}

              {/* BILLING */}
              {activeTab === "billing" && (
                <div className="space-y-4">
                  <h2 className="text-lg font-semibold text-gray-800">
                    Billing
                  </h2>

                  <div className="p-4 border rounded bg-gray-50">
                    No subscription found
                  </div>

                  <button className="bg-black text-white px-4 py-2 rounded">
                    Upgrade Plan
                  </button>
                </div>
              )}
            </motion.div>
          </div>
        </div>
      }
    </div>
  );
}
