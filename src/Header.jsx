// Header.jsx
export default function Header() {
  return (
    <div className="w-full sticky top-0 z-50 bg-white shadow">
      <img
        src="/Banner-SCR.jpeg"   // 👉 assegura't que està a /public/banner.jpg
        alt="Banner"
        className="w-full h-32 object-contain bg-black"
      />
      <h1 className="text-4xl font-bold text-center py-4 bg-white">
        Sealed league - Sorcerers at the Core
      </h1>
    </div>
  );
}
