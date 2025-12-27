import { Search, MapPin } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

const SearchBar = () => {
  const [keyword, setKeyword] = useState("");
  const [location, setLocation] = useState("");
  const navigate = useNavigate();

  const handleSearch = (e?: React.FormEvent) => {
    if (e) {
      e.preventDefault();
    }

    // Điều hướng đến trang jobs với query parameters
    const params = new URLSearchParams();
    if (keyword.trim()) {
      params.set("name", keyword.trim());
    }
    if (location.trim()) {
      params.set("location", location.trim());
    }

    const queryString = params.toString();
    navigate(`/jobs${queryString ? `?${queryString}` : ""}`);
  };

  return (
    <div className="relative w-full bg-gradient-to-r from-orange-500 via-orange-600 to-yellow-500 px-4 py-16">
      <div className="mx-auto mb-8 max-w-5xl text-center text-white">
        <h1 className="mb-2 text-3xl font-bold sm:text-4xl">
          Tìm kiếm việc làm phù hợp
        </h1>
        <p className="text-sm sm:text-base">
          Khám phá hàng nghìn cơ hội việc làm chất lượng cao mỗi ngày
        </p>
      </div>

      <form
        onSubmit={handleSearch}
        className="mx-auto flex max-w-4xl flex-col items-center gap-4 rounded-2xl bg-white/90 p-6 shadow-xl backdrop-blur-md sm:flex-row"
      >
        {/* Job title input */}
        <div className="flex flex-1 items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-3">
          <Search className="h-5 w-5 text-gray-500" />
          <input
            type="text"
            placeholder="Tên công việc, từ khoá..."
            className="w-full bg-transparent text-sm outline-none"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
          />
        </div>

        {/* Location input */}
        <div className="flex w-48 items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-3">
          <MapPin className="h-5 w-5 text-gray-500" />
          <input
            list="location-options"
            type="text"
            placeholder="Địa điểm"
            className="w-full bg-transparent text-sm outline-none"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
          />
          <datalist id="location-options">
            <option value="TP. Hồ Chí Minh" />
            <option value="Hà Nội" />
            <option value="Đà Nẵng" />
            <option value="Bình Dương" />
            <option value="Cần Thơ" />
          </datalist>
        </div>

        {/* Search button */}
        <button
          type="submit"
          className="w-full rounded-lg bg-orange-600 px-6 py-3 font-semibold text-white transition hover:bg-orange-700 sm:w-auto"
        >
          Tìm kiếm
        </button>
      </form>
    </div>
  );
};

export default SearchBar;
