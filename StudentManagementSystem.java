import java.util.Scanner;
import java.util.ArrayList;

public class StudentManagementSystem {
    static Scanner sc = new Scanner(System.in);

    public static void main(String[] args) {
        while (true) {
            System.out.println("\n==== Student Management System ====");
            System.out.println("1. Add Student");
            System.out.println("2. Display All Students");
            System.out.println("3. Search Student by ID");
            System.out.println("4. Update Student");
            System.out.println("5. Delete Student");
            System.out.println("6. Exit");
            System.out.print("Enter choice: ");
            int choice = sc.nextInt();
            switch (choice) {
                case 1 -> addStudent();
                case 2 -> displayAll();
                case 3 -> searchStudent();
                case 4 -> updateStudent();
                case 5 -> deleteStudent();
                case 6 -> {
                    System.out.println("Goodbye!");
                    return;
                }
                default -> System.out.println("Invalid choice.");
            }
        }
    }

    static void addStudent() {
        System.out.print("Enter ID: ");
        int id = sc.nextInt();
        sc.nextLine();
        System.out.print("Enter Name: ");
        String name = sc.nextLine();
        System.out.print("Enter Age: ");
        int age = sc.nextInt();
        sc.nextLine();
        System.out.print("Enter Course: ");
        String course = sc.nextLine();

        Student s = new Student(id, name, age, course);
        DBHelper.addStudent(s);
    }

    static void displayAll() {
        ArrayList<Student> list = DBHelper.getAllStudents();
        if (list.isEmpty()) {
            System.out.println("No records found.");
        } else {
            for (Student s : list) {
                System.out.println("ID: " + s.id + ", Name: " + s.name + ", Age: " + s.age + ", Course: " + s.course);
            }
        }
    }

    static void searchStudent() {
        System.out.print("Enter ID to search: ");
        int id = sc.nextInt();
        Student s = DBHelper.searchStudent(id);
        if (s != null) {
            System.out.println("ID: " + s.id + ", Name: " + s.name + ", Age: " + s.age + ", Course: " + s.course);
        } else {
            System.out.println("Student not found.");
        }
    }

    static void updateStudent() {
        System.out.print("Enter ID to update: ");
        int id = sc.nextInt();
        sc.nextLine();
        Student s = DBHelper.searchStudent(id);
        if (s == null) {
            System.out.println("Student not found.");
            return;
        }
        System.out.print("Enter new Name: ");
        s.name = sc.nextLine();
        System.out.print("Enter new Age: ");
        s.age = sc.nextInt();
        sc.nextLine();
        System.out.print("Enter new Course: ");
        s.course = sc.nextLine();
        DBHelper.updateStudent(s);
    }

    static void deleteStudent() {
        System.out.print("Enter ID to delete: ");
        int id = sc.nextInt();
        DBHelper.deleteStudent(id);
    }
}
