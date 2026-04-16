
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
import { handleApiError } from '@/lib/api-errors';

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ message: 'Authentication required' }, { status: 401 });
    }

    const { claimId, reportId, title, content, howTheyReunited } = await request.json();

    let lostReportId: string | undefined;
    let foundReportId: string | undefined;
    let mainReport: any;
    let otherReport: any;

    if (claimId) {
      const claim = await db.queryOne('SELECT * FROM claim_requests WHERE id = $1', [claimId]);
      if (!claim) {
        return NextResponse.json({ message: 'Claim not found' }, { status: 404 });
      }
      lostReportId = claim.lost_report_id;
      foundReportId = claim.found_report_id;

      mainReport = await db.queryOne('SELECT * FROM pet_reports WHERE id = $1', [lostReportId]);
      otherReport = await db.queryOne('SELECT * FROM pet_reports WHERE id = $1', [foundReportId]);
    } else if (reportId) {
      // Fallback if someone hits this old way
      mainReport = await db.queryOne('SELECT * FROM pet_reports WHERE id = $1', [reportId]);
      if (!mainReport) {
        return NextResponse.json({ message: 'Report not found' }, { status: 404 });
      }
      
      const sharedId = mainReport.pet_reunited_id;
      if (sharedId) {
        otherReport = await db.queryOne(
          'SELECT * FROM pet_reports WHERE pet_reunited_id = $1 AND id != $2',
          [sharedId, reportId]
        );
      }
    } else {
      return NextResponse.json({ message: 'Missing claimId or reportId' }, { status: 400 });
    }

    if (!mainReport) {
      return NextResponse.json({ message: 'Could not resolve main report' }, { status: 400 });
    }

    const slug = `${mainReport.pet_name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${Date.now()}`;

    let beforeImage = mainReport.photo_uri;
    let afterImage = otherReport?.photo_uri || null;

    const result = await db.queryOne(
      `INSERT INTO reunited_stories (
        slug, pet_name, pet_type, owner_name, story_title, story_content, 
        before_image_url, after_image_url, reunion_date, how_they_reunited, is_published
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW(), $9, true)
      RETURNING id`,
      [
        slug, mainReport.pet_name, mainReport.pet_type, user.display_name || 'Owner',
        title, content, beforeImage, afterImage, howTheyReunited
      ]
    );

    if(result?.id == null){
      return NextResponse.json({ success: false , message : 'Something went wrong' });
    }

    if (claimId && lostReportId && foundReportId) {
      await db.query(
        `UPDATE pet_reports 
         SET status = 'reunited', reunion_date = NOW(), pet_reunited_id = $1 
         WHERE id IN ($2, $3)`,
        [result.id, lostReportId, foundReportId]
      );
    } else {
      const sharedId = mainReport.pet_reunited_id;
      if (sharedId) {
        await db.query(
          'UPDATE pet_reports SET pet_reunited_id = $1, status = \'reunited\', reunion_date = NOW() WHERE pet_reunited_id = $2',
          [result.id, sharedId]
        );
      } else {
        await db.query(
          'UPDATE pet_reports SET pet_reunited_id = $1, status = \'reunited\', reunion_date = NOW() WHERE id = $2',
          [result.id, mainReport.id]
        );
      }
    }

    return NextResponse.json({ success: true, storyId: result.id });
  } catch (error) {
    return handleApiError(error);
  }
}
