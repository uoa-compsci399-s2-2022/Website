/**
 * The 'Class' route allows instructors to modify their classes.  This includes
 * adding new students, modifying the existing students, and create groups of
 * students.  We also want to assign quizzes from this page
 **/
import { useRouter } from 'next/router'

const Class = () => {
    const router = useRouter()
    const { classid } = router.query

    return <p>Class: {classid}</p>
}

export default Class