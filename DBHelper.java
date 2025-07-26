import java.sql.*;
import java.util.ArrayList;

public class DBHelper {
    static final String URL = "jdbc:mysql://localhost:3306/studentdb";
    static final String USER = "root";
    static final String PASS = "your_password"; // Change to your MySQL password

    public static Connection getConnection() throws SQLException {
        return DriverManager.getConnection(URL, USER, PASS);
    }

    public static void addStudent(Student s) {
        String sql = "INSERT INTO students (id, name, age, course) VALUES (?, ?, ?, ?)";
        try (Connection con = getConnection(); PreparedStatement pst = con.prepareStatement(sql)) {
            pst.setInt(1, s.id);
            pst.setString(2, s.name);
            pst.setInt(3, s.age);
            pst.setString(4, s.course);
            pst.executeUpdate();
            System.out.println("Student added to DB.");
        } catch (SQLException e) {
            System.out.println("Error: " + e.getMessage());
        }
    }

    public static ArrayList<Student> getAllStudents() {
        ArrayList<Student> list = new ArrayList<>();
        String sql = "SELECT * FROM students";
        try (Connection con = getConnection(); Statement st = con.createStatement(); ResultSet rs = st.executeQuery(sql)) {
            while (rs.next()) {
                list.add(new Student(rs.getInt("id"), rs.getString("name"), rs.getInt("age"), rs.getString("course")));
            }
        } catch (SQLException e) {
            System.out.println("Error: " + e.getMessage());
        }
        return list;
    }

    public static Student searchStudent(int id) {
        String sql = "SELECT * FROM students WHERE id = ?";
        try (Connection con = getConnection(); PreparedStatement pst = con.prepareStatement(sql)) {
            pst.setInt(1, id);
            ResultSet rs = pst.executeQuery();
            if (rs.next()) {
                return new Student(rs.getInt("id"), rs.getString("name"), rs.getInt("age"), rs.getString("course"));
            }
        } catch (SQLException e) {
            System.out.println("Error: " + e.getMessage());
        }
        return null;
    }

    public static void updateStudent(Student s) {
        String sql = "UPDATE students SET name = ?, age = ?, course = ? WHERE id = ?";
        try (Connection con = getConnection(); PreparedStatement pst = con.prepareStatement(sql)) {
            pst.setString(1, s.name);
            pst.setInt(2, s.age);
            pst.setString(3, s.course);
            pst.setInt(4, s.id);
            pst.executeUpdate();
            System.out.println("Student updated.");
        } catch (SQLException e) {
            System.out.println("Error: " + e.getMessage());
        }
    }

    public static void deleteStudent(int id) {
        String sql = "DELETE FROM students WHERE id = ?";
        try (Connection con = getConnection(); PreparedStatement pst = con.prepareStatement(sql)) {
            pst.setInt(1, id);
            pst.executeUpdate();
            System.out.println("Student deleted.");
        } catch (SQLException e) {
            System.out.println("Error: " + e.getMessage());
        }
    }
}
