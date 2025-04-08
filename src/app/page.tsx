import { Search, ShoppingCart, Heart, ChevronRight, ChevronLeft, Eye, Truck, Phone, ShieldCheck } from 'lucide-react';

export default function Home() {
  return (
    <main>
      {/* Categories Sidebar + Hero Section */}
      <div className="container mx-auto px-4 py-8 flex gap-8">

        {/* Categories */}
        <div className="hidden md:block w-64 space-y-4">
          <div className="flex items-center justify-between hover:text-red-500 cursor-pointer">
            <span>Woman's Fashion</span>
            <ChevronRight className="w-4 h-4" />
          </div>
          <div className="flex items-center justify-between hover:text-red-500 cursor-pointer">
            <span>Men's Fashion</span>
            <ChevronRight className="w-4 h-4" />
          </div>
          <div className="hover:text-red-500 cursor-pointer">Electronics</div>
          <div className="hover:text-red-500 cursor-pointer">Home & Lifestyle</div>
          <div className="hover:text-red-500 cursor-pointer">Medicine</div>
          <div className="hover:text-red-500 cursor-pointer">Sports & Outdoor</div>
          <div className="hover:text-red-500 cursor-pointer">Baby's & Toys</div>
          <div className="hover:text-red-500 cursor-pointer">Groceries & Pets</div>
          <div className="hover:text-red-500 cursor-pointer">Health & Beauty</div>
        </div>

        {/* Hero Section */}
        <div className="flex-1">
          <div className="bg-black rounded-lg overflow-hidden relative">
            <div className="absolute inset-0 bg-gradient-to-r from-black/80 to-transparent z-10"></div>
            <div className="relative z-20 p-12 text-white max-w-lg">
              <div className="flex items-center gap-2 mb-4">
                <img src="https://www.apple.com/v/iphone-14-pro/c/images/overview/hero/hero_iphone_14_pro__kzr001ge0262_large.jpg" alt="Apple Logo" className="w-8 h-8" />
                <span>iPhone 14 Series</span>
              </div>
              <h2 className="text-5xl font-bold mb-4">Up to 10% off Voucher</h2>
              <a href="#" className="inline-flex items-center text-lg hover:underline">
                Shop Now
                <ChevronRight className="w-5 h-5 ml-2" />
              </a>
            </div>
            <img 
              src="https://images.unsplash.com/photo-1678911820864-e4dc66c2acd9?auto=format&fit=crop&q=80&w=1200"
              alt="iPhone 14"
              className="absolute right-0 top-0 h-full w-1/2 object-cover object-left"
            />
          </div>
        </div>

      </div>
      <hr />

      {/* Flash Sales Section */}
      <div className="container mx-auto px-4 py-12">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="w-5 h-10 bg-red-500 rounded-sm"></div>
            <h2 className="text-2xl font-bold">Today's</h2>
          </div>
          <div className="flex items-center gap-4">
            <div className="grid grid-flow-col gap-2 text-center auto-cols-max">
              <div className="flex flex-col p-2 bg-gray-100 rounded-box text-neutral-content">
                <span className="font-mono text-2xl">03</span>
                <span className="text-xs">Days</span>
              </div>
              <div className="flex flex-col p-2 bg-gray-100 rounded-box text-neutral-content">
                <span className="font-mono text-2xl">23</span>
                <span className="text-xs">Hours</span>
              </div>
              <div className="flex flex-col p-2 bg-gray-100 rounded-box text-neutral-content">
                <span className="font-mono text-2xl">19</span>
                <span className="text-xs">Minutes</span>
              </div>
              <div className="flex flex-col p-2 bg-gray-100 rounded-box text-neutral-content">
                <span className="font-mono text-2xl">56</span>
                <span className="text-xs">Seconds</span>
              </div>
            </div>
            <div className="flex gap-2">
              <button className="p-2 rounded-full bg-gray-100 hover:bg-gray-200">
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button className="p-2 rounded-full bg-gray-100 hover:bg-gray-200">
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Product Card */}
          {[1, 2, 3, 4].map((item) => (
            <div key={item} className="group relative bg-gray-50 rounded-lg p-4">
              <div className="relative aspect-square mb-4">
                <span className="absolute top-2 left-2 bg-red-500 text-white text-sm px-2 py-1 rounded">-40%</span>
                <img 
                  src={`https://images.unsplash.com/photo-${1670000000000 + item}?auto=format&fit=crop&q=80&w=400`}
                  alt="Product"
                  className="w-full h-full object-cover rounded-lg"
                />
                <div className="absolute top-2 right-2 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button className="p-2 bg-white rounded-full hover:bg-gray-100">
                    <Heart className="w-4 h-4" />
                  </button>
                  <button className="p-2 bg-white rounded-full hover:bg-gray-100">
                    <Eye className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <h3 className="font-semibold mb-2">Product Name</h3>
              <div className="flex items-center gap-2">
                <span className="text-red-500">$120</span>
                <span className="text-gray-400 line-through">$160</span>
              </div>
            </div>
          ))}
        </div>
      </div>
      <hr />

      {/* Explore Our Porducts */}
      <div className="container mx-auto px-4 py-12">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="w-5 h-10 bg-red-500 rounded-sm"></div>
            <h2 className="text-2xl font-bold">Our Products</h2>
          </div>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Product Card */}
          {[1, 2, 3, 4, 5, 6, 7, 8].map((item) => (
            <div key={item} className="group relative bg-gray-50 rounded-lg p-4">
              <div className="relative aspect-square mb-4">
                <span className="absolute top-2 left-2 bg-red-500 text-white text-sm px-2 py-1 rounded">-40%</span>
                <img 
                  src={`https://images.unsplash.com/photo-${1670000000000 + item}?auto=format&fit=crop&q=80&w=400`}
                  alt="Product"
                  className="w-full h-full object-cover rounded-lg"
                />
                <div className="absolute top-2 right-2 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button className="p-2 bg-white rounded-full hover:bg-gray-100">
                    <Heart className="w-4 h-4" />
                  </button>
                  <button className="p-2 bg-white rounded-full hover:bg-gray-100">
                    <Eye className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <h3 className="font-semibold mb-2">Product Name</h3>
              <div className="flex items-center gap-2">
                <span className="text-red-500">$120</span>
                <span className="text-gray-400 line-through">$160</span>
              </div>
            </div>
          ))}
        </div>
      </div>
      <hr />

      {/* New Arrivals Section */}
      <div className="container mx-auto px-4 py-12">
        <h2 className="text-2xl font-bold mb-8">New Arrival</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="col-span-2 row-span-2">
            <div className="bg-black rounded-lg p-8 h-full flex flex-col justify-between text-white">
              <h3 className="text-2xl font-bold">PlayStation 5</h3>
              <p className="text-gray-300">Black and White version of the PS5 coming out on sale.</p>
              <a href="#" className="text-white hover:underline">Shop Now</a>
            </div>
          </div>
          <div className="bg-gray-900 rounded-lg p-6 text-white">
            <h3 className="text-xl font-bold mb-2">Women's Collections</h3>
            <p className="text-sm text-gray-300 mb-4">Featured woman collections that give you another vibe.</p>
            <a href="#" className="text-white hover:underline">Shop Now</a>
          </div>
          <div className="bg-gray-900 rounded-lg p-6 text-white">
            <h3 className="text-xl font-bold mb-2">Speakers</h3>
            <p className="text-sm text-gray-300 mb-4">Amazon wireless speakers</p>
            <a href="#" className="text-white hover:underline">Shop Now</a>
          </div>
          <div className="bg-gray-900 rounded-lg p-6 text-white">
            <h3 className="text-xl font-bold mb-2">Perfume</h3>
            <p className="text-sm text-gray-300 mb-4">GUCCI INTENSE OUD EDP</p>
            <a href="#" className="text-white hover:underline">Shop Now</a>
          </div>
        </div>
      </div>
      <hr />

      {/* Services Section */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="flex flex-col items-center text-center">
            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <Truck className="w-6 h-6" />
            </div>
            <h3 className="font-semibold mb-2">FREE AND FAST DELIVERY</h3>
            <p className="text-sm text-gray-600">Free delivery for all orders over $140</p>
          </div>
          <div className="flex flex-col items-center text-center">
            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <Phone className="w-6 h-6" />
            </div>
            <h3 className="font-semibold mb-2">24/7 CUSTOMER SERVICE</h3>
            <p className="text-sm text-gray-600">Friendly 24/7 customer support</p>
          </div>
          <div className="flex flex-col items-center text-center">
            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="font-semibold mb-2">MONEY BACK GUARANTEE</h3>
            <p className="text-sm text-gray-600">We return money within 30 days</p>
          </div>
        </div>
      </div>

    </main>
  );
}