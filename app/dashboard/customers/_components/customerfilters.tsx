"use client";

type Props = {
  search: string;
  setSearch: (v: string) => void;
  filter: string;
  setFilter: (v: string) => void;
};

export default function CustomerFilters({
  search,
  setSearch,
  filter,
  setFilter,
}: Props) {
  return (
    <div className="bg-white border rounded-xl shadow-sm p-4">
      <div className="flex flex-col md:flex-row gap-3 md:items-center md:justify-between">
        {/* SEARCH */}
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search customers..."
          className="w-full md:w-1/2 border border-gray-300 text-gray-600 p-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-200"
        />

        {/* FILTER */}
        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="w-full sm:w-auto border border-gray-300 text-gray-600 p-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-200"
          >
            <option value="all">All Customers</option>
            <option value="active">Active</option>
            <option value="owing">Owing</option>
            <option value="recent">Recently Added</option>
          </select>

          {/* optional spacing consistency button slot (future-proof UI) */}
        </div>
      </div>
    </div>
  );
}
