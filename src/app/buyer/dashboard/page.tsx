"use client";

import { useEffect, useState, useCallback, useMemo, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Search as IconSearch, ShoppingCart as IconCart, RefreshCcw, Heart, Filter } from "lucide-react";

interface BankInfo {
  bankName: string;
  accountNumber: string;
}

interface Profile {
  name: string;
  email: string;
  isVerified: boolean;
  bankInfo?: BankInfo;
}

interface Product {
  _id: string;
  name: string;
  description?: string;
  price: number;
  imageUrl?: string;
  stock: number;
  sellerId?: {
    _id: string;
    name: string;
    email?: string;
  };
  inWishlist?: boolean;
  averageRating?: number;
  createdAt?: string;
}

interface WishlistProduct {
  _id: string;
  name: string;
  description?: string;
  price: number;
  imageUrl?: string;
  stock: number;
  sellerId?: {
    _id: string;
    name: string;
    email?: string;
  };
}

interface Profile {
  name: string;
  email: string;
  isVerified: boolean;
  bankInfo?: BankInfo;
  wishlist?: WishlistProduct[];
}
export default function BuyerHome() {
	const [profile, setProfile] = useState<Profile | null>(null);
	const [profileLoading, setProfileLoading] = useState(true); // { changed code }
	const [products, setProducts] = useState<Product[]>([]);
	const [loadingProducts, setLoadingProducts] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const router = useRouter();

	// Memoize profile name to avoid unnecessary re-renders
	const profileName = useMemo(() => profile?.name || "Guest", [profile?.name]);

	// New: search + pagination + filtering local state
	const [search, setSearch] = useState("");
	const [visibleCount, setVisibleCount] = useState(12);
	const [sortBy, setSortBy] = useState("newest");
	const [priceRange, setPriceRange] = useState<[number, number]>([0, 10000]);
	const [minRating, setMinRating] = useState(0);
	const [showFilters, setShowFilters] = useState(false);
	const searchRef = useRef<number | null>(null);

	// Fetch user profile (buyer) with proper loading handling
	useEffect(() => {
		const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
		if (!token) {
			router.replace("/login");
			return;
		}

		let mounted = true;
		setProfileLoading(true);
		fetch("/api/buyer/profile", { headers: { Authorization: `Bearer ${token}` } })
			.then((res) => res.json())
			.then((data: Profile) => {
				if (!mounted) return;
				setProfile(data);
			})
			.catch(() => {
				if (!mounted) return;
				setProfile(null);
			})
			.finally(() => { if (mounted) setProfileLoading(false); });

		return () => { mounted = false; };
	}, [router]);

	// Robust product fetch with AbortController + useCallback
	const fetchProducts = useCallback(async (q = "") => {
		const controller = new AbortController();
		try {
			setLoadingProducts(true);
			setError(null);

			const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
			const url = q ? `/api/buyer/products?search=${encodeURIComponent(q)}&limit=50` : "/api/buyer/products?limit=50";

			const res = await fetch(url, {
				headers: token ? { Authorization: `Bearer ${token}` } : {},
				signal: controller.signal,
			});
			const data = await res.json();
			if (res.ok && Array.isArray(data.products)) {
				// show all (shuffled for discovery)
				setProducts(data.products.sort(() => 0.5 - Math.random()));
			} else {
				setProducts([]);
				setError(data.error || "Failed to fetch products");
			}
		} catch (err: unknown) {
	 if (err instanceof Error) {
	   if (err.name !== "AbortError") {
	     console.error("Fetch error:", err);
	     setError("Error fetching products");
	   }
	 } else {
	   console.error("Fetch error (unknown):", err);
	   setError("Error fetching products");
	 }
		} finally {
			setLoadingProducts(false);
		}

		return () => controller.abort();
	}, []);

	// initial fetch
	useEffect(() => {
		fetchProducts();
	}, [fetchProducts]);

	// debounce search and call server-side search (keeps server in sync)
	useEffect(() => {
		if (searchRef.current) window.clearTimeout(searchRef.current);
		searchRef.current = window.setTimeout(() => {
			setVisibleCount(12); // reset pagination on search
			fetchProducts(search.trim());
		}, 400);
		return () => { if (searchRef.current) window.clearTimeout(searchRef.current); };
	}, [search, fetchProducts]);

	// client-side filtered list + sorting + memoized slice for visible items
	const filteredProducts = useMemo(() => {
		let filtered = products;

		// Text search
		const q = search.trim().toLowerCase();
		if (q) {
			filtered = filtered.filter((p) =>
				p.name.toLowerCase().includes(q) ||
				(p.description || "").toLowerCase().includes(q) ||
				p.sellerId?.name?.toLowerCase().includes(q)
			);
		}

		// Price range filter
		filtered = filtered.filter((p) =>
			p.price >= priceRange[0] && p.price <= priceRange[1]
		);

		// Minimum rating filter (if available)
		if (minRating > 0) {
			// Assuming we'll add rating data to products later
			filtered = filtered.filter((p) => (p.averageRating || 0) >= minRating);
		}

		// Sorting
		filtered.sort((a, b) => {
			switch (sortBy) {
				case "price-low":
					return a.price - b.price;
				case "price-high":
					return b.price - a.price;
				case "rating":
					return (b.averageRating || 0) - (a.averageRating || 0);
				case "newest":
				default:
					return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
			}
		});

		return filtered;
	}, [products, priceRange, minRating, sortBy, search]); // Added search back as it's still used in client-side filtering

	const displayed = useMemo(() => filteredProducts.slice(0, visibleCount), [filteredProducts, visibleCount]);
	const hasMore = filteredProducts.length > visibleCount;

	// Add-to-cart handler (simple POST + feedback)
	const [addingToCartId, setAddingToCartId] = useState<string | null>(null);
	const addToCart = useCallback(async (productId: string) => {
		const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
		if (!token) {
			alert("Please login to add items to cart.");
			router.push("/login");
			return;
		}
		setAddingToCartId(productId);
		try {
			const res = await fetch("/api/buyer/cart", {
				method: "POST",
				headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
				body: JSON.stringify({ productId, quantity: 1 }),
			});
			const data = await res.json();
			if (res.ok) {
				// lightweight feedback - use toast/snackbar instead of alert for better UX
				console.log("Added to cart");
			} else {
				console.error(data.error || "Failed to add to cart");
			}
		} catch (err) {
			console.error("Add to cart error:", err);
		} finally {
			setAddingToCartId(null);
		}
	}, [router]);

	// Wishlist handler
	const [updatingWishlistId, setUpdatingWishlistId] = useState<string | null>(null);
	const toggleWishlist = useCallback(async (productId: string) => {
		const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
		if (!token) {
			alert("Please login to manage wishlist.");
			router.push("/login");
			return;
		}
		setUpdatingWishlistId(productId);
		try {
			const res = await fetch("/api/buyer/wishlist", {
				method: "POST",
				headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
				body: JSON.stringify({ productId }),
			});
			const data = await res.json();
			if (res.ok) {
				// Update the product's inWishlist status locally
				setProducts(prev => prev.map(p =>
					p._id === productId ? { ...p, inWishlist: data.action === 'added' } : p
				));
				console.log(data.action === 'added' ? "Added to wishlist" : "Removed from wishlist");
			} else {
				console.error(data.error || "Failed to update wishlist");
			}
		} catch (err) {
			console.error("Wishlist error:", err);
			alert("Error updating wishlist");
		} finally {
			setUpdatingWishlistId(null);
		}
	}, [router]);

	const truncateText = (text: string | undefined | null, maxLength: number) => {
		if (!text) return "";
		if (text.length <= maxLength) return text;
		return text.substring(0, maxLength) + "...";
	};

	// Render: handle profile loading
	if (profileLoading) {
		return (
			<div className="flex items-center justify-center min-h-screen">
				<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-600" />
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
			{/* Modern Hero Section */}
			<div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
				<div className="max-w-7xl mx-auto px-4 py-8">
					<div className="flex flex-col md:flex-row items-center justify-between gap-6">
						<div className="space-y-2">
							<h1 className="text-4xl font-bold">
								Welcome back, {profileName} 👋
							</h1>
							<p className="text-blue-100">Discover amazing products curated just for you</p>
						</div>
						
						{/* Quick Stats */}
						<div className="flex gap-4">
							<div className="bg-white/10 backdrop-blur-lg rounded-xl p-4 text-center">
								<div className="text-2xl font-bold">0</div>
								<div className="text-sm text-blue-100">Orders</div>
							</div>
							<div className="bg-white/10 backdrop-blur-lg rounded-xl p-4 text-center">
								<div className="text-2xl font-bold">0</div>
								<div className="text-sm text-blue-100">Wishlist</div>
							</div>
						</div>
					</div>
				</div>
			</div>

			{/* Navigation Bar */}
			<div className="sticky top-0 z-10 bg-white/80 backdrop-blur-lg border-b border-gray-200">
				<div className="max-w-7xl mx-auto px-4">
					<div className="flex items-center h-16 gap-8">
						<button className="text-gray-600 hover:text-blue-600 transition-colors">
							All Products
						</button>
						<button className="text-gray-600 hover:text-blue-600 transition-colors">
							Featured
						</button>
						<button className="text-gray-600 hover:text-blue-600 transition-colors">
							New Arrivals
						</button>
						<div className="ml-auto flex items-center gap-4">
							<button
								onClick={() => fetchProducts()}
								className="flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors"
							>
								<span>Refresh</span>
								<svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
									<path d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" 
										strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
									/>
								</svg>
							</button>
						</div>
					</div>
				</div>
			</div>

			<div className="max-w-7xl mx-auto px-4 py-8">
				{/* Search + filters */}
				<div className="flex flex-col gap-4 mb-6">
					<div className="flex items-center gap-4">
						<div className="relative flex-1 max-w-lg">
							<IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
							<input
								type="search"
								value={search}
								onChange={(e) => setSearch(e.target.value)}
								placeholder="Search products, seller..."
								aria-label="Search products"
								className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
							/>
						</div>

						<button
							onClick={() => setShowFilters(!showFilters)}
							className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg transition ${
								showFilters
									? 'bg-blue-600 text-white'
									: 'bg-gray-100 text-gray-600 hover:bg-gray-200'
							}`}
						>
							<Filter className="w-4 h-4" /> Filters
						</button>

						<button
							onClick={() => fetchProducts()}
							className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition"
							aria-label="Refresh products"
						>
							<RefreshCcw className="w-4 h-4" /> Refresh
						</button>
					</div>

					{/* Filters Panel */}
					{showFilters && (
						<div className="bg-white border rounded-lg p-4 shadow-sm">
							<div className="grid grid-cols-1 md:grid-cols-4 gap-4">
								{/* Sort By */}
								<div>
									<label className="block text-sm font-medium text-gray-700 mb-2">Sort By</label>
									<select
										value={sortBy}
										onChange={(e) => setSortBy(e.target.value)}
										className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
									>
										<option value="newest">Newest</option>
										<option value="price-low">Price: Low to High</option>
										<option value="price-high">Price: High to Low</option>
										<option value="rating">Rating</option>
									</select>
								</div>

								{/* Price Range */}
								<div>
									<label className="block text-sm font-medium text-gray-700 mb-2">
										Price Range: ฿{priceRange[0]} - ฿{priceRange[1]}
									</label>
									<div className="px-2">
										<input
											type="range"
											min="0"
											max="10000"
											step="100"
											value={priceRange[0]}
											onChange={(e) => setPriceRange([parseInt(e.target.value), priceRange[1]])}
											className="w-full"
										/>
										<input
											type="range"
											min="0"
											max="10000"
											step="100"
											value={priceRange[1]}
											onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value)])}
											className="w-full mt-2"
										/>
									</div>
								</div>

								{/* Minimum Rating */}
								<div>
									<label className="block text-sm font-medium text-gray-700 mb-2">Min Rating</label>
									<select
										value={minRating}
										onChange={(e) => setMinRating(parseInt(e.target.value))}
										className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
									>
										<option value="0">Any Rating</option>
										<option value="3">3+ Stars</option>
										<option value="4">4+ Stars</option>
										<option value="5">5 Stars</option>
									</select>
								</div>

								{/* Clear Filters */}
								<div className="flex items-end">
									<button
										onClick={() => {
											setSortBy("newest");
											setPriceRange([0, 10000]);
											setMinRating(0);
											setSearch("");
										}}
										className="w-full px-4 py-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition"
									>
										Clear Filters
									</button>
								</div>
							</div>
						</div>
					)}
				</div>

				{/* live region for results count */}
				<div className="sr-only" aria-live="polite">
					{filteredProducts.length} products available
				</div>

				{loadingProducts ? (
					<div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
						{[...Array(8)].map((_, i) => (
							<div key={i} className="bg-white rounded-2xl shadow-sm p-4 animate-pulse">
								<div className="h-48 bg-gray-200 rounded-xl mb-4" />
								<div className="space-y-3">
									<div className="h-4 bg-gray-200 rounded w-3/4" />
									<div className="h-4 bg-gray-200 rounded w-1/2" />
								</div>
							</div>
						))}
					</div>
				) : error ? (
					<div className="text-center py-12">
						<div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 text-red-600 mb-4">⚠️</div>
						<h3 className="text-lg font-medium text-gray-900 mb-2">Oops! Something went wrong</h3>
						<p className="text-gray-500 mb-4">{error}</p>
						<button onClick={() => fetchProducts()} className="px-6 py-2 bg-blue-600 text-white rounded-lg">Try Again</button>
					</div>
				) : filteredProducts.length === 0 ? (
					<div className="text-center py-12">
						<div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">📦</div>
						<h3 className="text-lg font-medium text-gray-900">No products found</h3>
						<p className="text-gray-500">Check back later for new items</p>
					</div>
				) : (
					<>
						<div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
							{displayed.map((product) => (
								<div key={product._id} className="group bg-white rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden">
									<Link href={`/buyer/products/${product._id}`} className="relative block aspect-square">
										{product.imageUrl ? (
											<Image src={product.imageUrl} alt={product.name} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
										) : (
											<div className="w-full h-full flex items-center justify-center bg-gray-100 text-4xl">📦</div>
										)}
										<div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
										<div className="absolute bottom-4 left-4 right-4 transform translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all">
											<div className="text-white text-sm font-medium">View Details →</div>
										</div>
									</Link>

									<div className="p-4">
										<div className="flex items-start justify-between gap-2">
											<h3 className="font-medium text-gray-900">{truncateText(product.name, 40)}</h3>
											<span className="text-lg font-bold text-blue-600">฿{product.price.toLocaleString()}</span>
										</div>

										<div className="mt-2 flex items-center justify-between">
											<div className={`px-2 py-1 rounded-full text-xs font-medium ${product.stock > 10 ? 'bg-green-100 text-green-700' : product.stock > 0 ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}`}>
												{product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
											</div>

											<div className="flex items-center gap-2">
												<button
													onClick={() => toggleWishlist(product._id)}
													disabled={updatingWishlistId === product._id}
													className={`p-2 rounded-full transition-colors ${
														product.inWishlist
															? 'text-red-600 hover:text-red-700 bg-red-50'
															: 'text-gray-400 hover:text-red-600 hover:bg-red-50'
													}`}
													aria-label={product.inWishlist ? "Remove from wishlist" : "Add to wishlist"}
												>
													<Heart className={`w-4 h-4 ${product.inWishlist ? 'fill-current' : ''}`} />
												</button>
												<button
													onClick={() => addToCart(product._id)}
													disabled={addingToCartId === product._id}
													className="inline-flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700 transition disabled:opacity-60"
													aria-label={`Add ${product.name} to cart`}
												>
													<IconCart className="w-4 h-4" />
													{addingToCartId === product._id ? 'Adding...' : 'Add'}
												</button>
											</div>
										</div>
									</div>
								</div>
							))}
						</div>

						{hasMore && (
							<div className="mt-8 flex justify-center">
								<button onClick={() => setVisibleCount((v) => v + 12)} className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700">Load more</button>
							</div>
						)}
					</>
				)}
			</div>
		</div>
	);
}