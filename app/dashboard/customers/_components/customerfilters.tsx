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
    <div className="flex flex-col md:flex-row gap-3 justify-between">
      {/* SEARCH */}
      <input
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search customers..."
        className="w-full md:w-1/2 border p-2 border-gray-300 text-gray-600 rounded-lg"
      />

      {/* FILTER */}
      <select
        value={filter}
        onChange={(e) => setFilter(e.target.value)}
        className="border border-gray-300 text-gray-600 p-2 rounded-lg"
      >
        <option value="all">All Customers</option>
        <option value="active">Active</option>
        <option value="owing">Owing</option>
        <option value="recent">Recently Added</option>
      </select>
    </div>
  );
}
