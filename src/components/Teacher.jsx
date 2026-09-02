import teacherProfile from "../assets/picture/Ma'am_tan_profile.png"

const highlights = [
  ["8+", "Years in ALS service"],
  ["3", "Learning areas"],
  ["100%", "Learner-centered"],
]

function TeacherCard({ settings, profile }) {
  const teacher = profile || {
    name: settings?.teacher_name || "Ma'am Tan",
    role: settings?.teacher_role || "Elementary ALS Coordinator",
    bio: settings?.teacher_bio || "Hello, I'm Ma'am Tan, an Elementary ALS Coordinator with eight years of service in the Alternative Learning System.",
    quote: settings?.teacher_quote || "Every learner deserves a supportive path back to education.",
    image_url: null,
  };
  return (
    <div
      style={{
        maxWidth: "500px",
        margin: "20px auto",
        border: "1px solid #ddd",
        borderRadius: "12px",
        backgroundColor: "#fff",
        boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
        padding: "16px",
        display: "flex",
        alignItems: "flex-start",
        gap: "16px",
        fontFamily: "Arial, sans-serif",
      }}
    >
      {/* Photo - left side */}
      <div
        style={{
          width: "120px",
          height: "150px",

          flexShrink: 0,
          overflow: "hidden",
          borderRadius: "8px",
          backgroundColor: "#f0f0f0",
        }}
      >
        <img
          src={teacher.image_url || teacherProfile}
          alt={teacher.name}
          style={{ width: "100%", height: "100%",  }}
        />
      </div>

      {/* Right side content */}
      <div style={{ textAlign: "left", flex: 1 }}>
        {/* Name & Role */}
        <h3 style={{ margin: 0, fontSize: "18px", fontWeight: "bold", color: "#1a1a40" }}>
          {teacher.name}
        </h3>
        <p style={{ fontSize: "12px", color: "#666", marginTop: "2px" }}>
          {teacher.role}
        </p>

        {/* Bio */}
        <p style={{ marginTop: "10px", fontSize: "13px", color: "#444", lineHeight: "1.4" }}>
          {teacher.bio}
        </p>

        {/* Quote */}
        <p style={{ marginTop: "8px", fontSize: "12px", fontStyle: "italic", color: "#555" }}>
          “{teacher.quote}”
        </p>

        {/* Highlights */}
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: "12px" }}>
          {highlights.map(([value, label]) => (
            <div
              key={label}
              style={{
                flex: 1,
                margin: "0 4px",
                background: "#f9f9f9",
                borderRadius: "6px",
                padding: "6px",
                textAlign: "center",
              }}
            >
              <p style={{ fontSize: "14px", fontWeight: "bold", color: "#1a1a40" }}>{value}</p>
              <p style={{ fontSize: "10px", color: "#666" }}>{label}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function Teacher({ settings, teachers = [] }) {
  const profiles = teachers.length > 0 ? teachers : [null];
  return (
    <div className="px-4 py-8 bg-bg sm:px-6">
      <div className="grid max-w-6xl gap-6 mx-auto lg:grid-cols-2">
        {profiles.map((profile, index) => <TeacherCard key={profile?.id || index} settings={settings} profile={profile} />)}
      </div>
    </div>
  );
}

export default Teacher