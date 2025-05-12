import { Suspense } from "react";
import Search from "./components/Search";

const SearchPage = () => {
    return (
        <Suspense fallback={<div>Loading search...</div>}>
            <Search />
        </Suspense>
    );
};

export default SearchPage;
