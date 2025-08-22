// Header.jsx
export default function Header() {
  return (
    <div className="w-full sticky top-0 z-50 bg-white shadow">
      <img
        src="/Banner-SCR.jpeg"   // 👉 assegura't que està a /public/banner.jpg
        alt="Banner"
        className="w-full h-32 object-contain bg-black"
      />
      <h1 className="absolute inset-0 flex items-center justify-center 
                  text-5xl font-bold 
                  text-white dark:text-gray-100 
                  bg-black/40 dark:bg-black/60">
        Sealed league - Sorcerers at the Core
      </h1>
    </div>
  );
}
