import server
import time
import unittest


class TestReuseIdManager(unittest.TestCase):
    def setUp(self):
        self.id_manager = server.ReuseIdManager(0)

    def test_1(self):
        self.assertEqual(self.id_manager.get_id(), 1)
        self.assertEqual(self.id_manager.get_id(), 2)
        self.assertEqual(self.id_manager.get_id(), 3)

    def test_2(self):
        self.assertRaises(KeyError, self.id_manager.return_id, 1)

    def test_3(self):
        for x in range(1, 11):
            self.assertEqual(self.id_manager.get_id(), x)
        self.id_manager.return_id(7)
        self.id_manager.return_id(4)
        self.assertEqual(self.id_manager.get_id(), 4)
        self.assertEqual(self.id_manager.get_id(), 7)
        self.assertEqual(self.id_manager.get_id(), 11)

    def test_4(self):
        for x in range(1, 11):
            self.id_manager.get_id()
        for x in range(1, 11):
            self.id_manager.return_id(x)
        for x in range(1, 11):
            self.assertEqual(self.id_manager.get_id(), x)

    def test_5(self):
        self.id_manager.return_wait = 0.0001

        for x in range(1, 11):
            self.assertEqual(self.id_manager.get_id(), x)
        self.id_manager.return_id(7)
        self.id_manager.return_id(4)
        self.assertEqual(self.id_manager.get_id(), 11)
        time.sleep(0.0001)
        self.assertEqual(self.id_manager.get_id(), 4)
        self.assertEqual(self.id_manager.get_id(), 7)

    def test_6(self):
        self.id_manager.return_wait = 0.0001

        self.assertEqual(self.id_manager.get_id(), 1)
        self.assertEqual(self.id_manager.get_id(), 2)
        self.assertEqual(self.id_manager.get_id(), 3)
        self.id_manager.return_id(3)
        self.id_manager.return_id(2)
        self.assertEqual(self.id_manager.get_id(), 4)
        time.sleep(0.0001)
        self.assertEqual(self.id_manager.get_id(), 2)
        self.id_manager.return_id(1)
        time.sleep(0.0001)
        self.assertEqual(self.id_manager.get_id(), 1)
        self.assertEqual(self.id_manager.get_id(), 3)


class TestIncrementIdManager(unittest.TestCase):
    def setUp(self):
        self.id_manager = server.IncrementIdManager()

    def test_1(self):
        self.assertEqual(self.id_manager.get_id(), 1)
        self.assertEqual(self.id_manager.get_id(), 2)
        self.id_manager.return_id(99)
        self.assertEqual(self.id_manager.get_id(), 3)


if __name__ == '__main__':
    unittest.main()
